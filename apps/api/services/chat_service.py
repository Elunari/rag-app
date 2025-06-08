import os
from datetime import datetime
from typing import Dict, Any, List
import boto3
import uuid
import json
import logging
from utils.errors import APIError

logger = logging.getLogger(__name__)

class ChatService:
    def __init__(self):
        self.dynamodb = boto3.resource('dynamodb')
        self.table = self.dynamodb.Table(f"{os.environ['PROJECT_NAME']}-chats")
        self.messages_table = self.dynamodb.Table(f"{os.environ['PROJECT_NAME']}-messages")
        self.bedrock = boto3.client('bedrock-runtime', region_name='us-east-1')
        self.kendra = boto3.client('kendra', region_name='us-east-1')
        self.model_id = 'arn:aws:bedrock:us-east-1:727646510092:inference-profile/us.anthropic.claude-3-5-sonnet-20241022-v2:0'
        self.kendra_index_id = os.environ['KENDRA_INDEX_ID']
    
    def get_chats(self, user_id: str = None) -> List[Dict[str, Any]]:
        if user_id:
            response = self.table.query(
                IndexName='LastMessageIndex',
                KeyConditionExpression='userId = :userId',
                ExpressionAttributeValues={
                    ':userId': user_id
                },
                ScanIndexForward=False
            )
        else:
            response = self.table.scan()
        return response.get('Items', [])

    def get_chat(self, chat_id: str, user_id: str = None) -> Dict[str, Any]:
        if not user_id:
            raise APIError('User ID is required to get a chat', 400)
            
        response = self.table.get_item(
            Key={
                'userId': user_id,
                'chatId': chat_id
            }
        )
        chat = response.get('Item')
        
        if not chat:
            raise APIError('Chat not found', 404)
            
        return chat

    def create_chat(self, title: str = 'New Chat', user_id: str = None) -> Dict[str, Any]:
        if not user_id:
            raise APIError('User ID is required to create a chat', 400)
            
        existing_chats = self.get_chats(user_id)
        for chat in existing_chats:
            if chat.get('title') == title:
                raise APIError(f'Chat with name "{title}" already exists', 409)
        
        chat_id = str(uuid.uuid4())
        timestamp = datetime.utcnow().isoformat()
        
        chat = {
            'userId': user_id,
            'chatId': chat_id,
            'title': title,
            'created_at': timestamp,
            'updated_at': timestamp,
            'messageCount': 0
        }
        
        self.table.put_item(Item=chat)
        return chat

    def _get_chat_history(self, chat_id: str) -> List[Dict[str, str]]:
        """Get chat history in the format expected by Claude"""
        response = self.messages_table.query(
            KeyConditionExpression='chatId = :chatId',
            ExpressionAttributeValues={
                ':chatId': chat_id
            },
            ScanIndexForward=True
        )
        
        messages = []
        for item in response.get('Items', []):
            role = 'assistant' if item['author'] == 'assistant' else 'user'
            messages.append({
                'role': role,
                'content': item['message']
            })
        return messages

    def _format_chat_history(self, chat_history: List[Dict[str, str]]) -> str:
        """Format chat history for Titan Text Lite"""
        formatted_history = ""
        for msg in chat_history:
            role = "Human" if msg['role'] == 'user' else "Assistant"
            formatted_history += f"{role}: {msg['content']}\n"
        return formatted_history
    
    def _query_kendra(self, query: str) -> str:
        """Query Kendra for relevant context based on the user's message."""
        try:
            response = self.kendra.query(
                IndexId=self.kendra_index_id,
                QueryText=query
            )

            if not response.get('ResultItems'):
                return ""

            result_items = response['ResultItems'][:3]

            context_parts = []
            for item in result_items:
                title = item.get('DocumentTitle', {}).get('Text') if isinstance(item.get('DocumentTitle'), dict) else item.get('DocumentTitle', 'Untitled')
                excerpt = item.get('DocumentExcerpt', {}).get('Text', '')

                context_parts.append(
                    f"Relevant information from document '{title}':\n{excerpt}"
                )
            
            logger.info(result_items)

            return "\n\n".join(context_parts)

        except Exception as e:
            logger.error("Error querying Kendra: %s", str(e))
            return ""



    def send_message(self, chat_id: str, content: str, user_id: str = None, role: str = 'user') -> Dict[str, Any]:
        if not user_id:
            raise APIError('User ID is required to send a message', 400)
            
        chat = self.get_chat(chat_id, user_id)
        now = int(datetime.utcnow().timestamp() * 1000)
        
 
        user_message = {
            'chatId': chat_id,
            'messageId': f"msg_{now}_user",
            'userId': user_id,
            'author': 'user',
            'message': content,
            'timestamp': now
        }
        
        self.messages_table.put_item(Item=user_message)
        
        self.table.update_item(
            Key={
                'userId': user_id,
                'chatId': chat_id
            },
            UpdateExpression="SET lastMessageAt = :lma, messageCount = if_not_exists(messageCount, :zero) + :inc",
            ExpressionAttributeValues={
                ':lma': now,
                ':inc': 1,
                ':zero': 0
            }
        )

        logger.info("QUERYING KENDRA")

        kendra_context = self._query_kendra(content)

        logger.info("KENDRA content: %s", kendra_context)

        chat_history = self._get_chat_history(chat_id)

        logger.info("CHAT HISTORY: %s", chat_history)
        formatted_history = self._format_chat_history(chat_history)

        logger.info("FORMATTED HISTORY: %s", formatted_history)
        
        context_prompt = f"\nHere is some relevant information that might help answer the question:\n{kendra_context}\n\n" if kendra_context else ""
        
        logger.info("CONTEXT: %s", f"{context_prompt}")
        
        messages_for_claude = []
        for msg in chat_history:
            messages_for_claude.append({
                "role": msg['role'],
                "content": msg['content']
            })

        request_body = {
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 1000,
            "temperature": 0.3,
            "top_p": 0.1,
            "messages": messages_for_claude,
            "system": context_prompt if context_prompt else ""
        }

        response = self.bedrock.invoke_model(
            modelId=self.model_id,
            body=json.dumps(request_body)
        )
        
        logger.info(response)
        
        response_body = json.loads(response['body'].read())
        logger.debug(f"Bedrock response: {json.dumps(response_body)}")
        

        ai_message = response_body['content'][0]['text'].strip()
        
        ai_response = {
            'chatId': chat_id,
            'messageId': f"msg_{now + 1}_assistant",
            'userId': user_id,
            'author': 'assistant',
            'message': ai_message,
            'timestamp': now + 1000
        }
        
        self.messages_table.put_item(Item=ai_response)
        
        self.table.update_item(
            Key={
                'userId': user_id,
                'chatId': chat_id
            },
            UpdateExpression="SET lastMessageAt = :lma, messageCount = messageCount + :inc",
            ExpressionAttributeValues={
                ':lma': now + 1000,
                ':inc': 1
            }
        )
        
        return ai_response

    def get_messages(self, chat_id: str, user_id: str) -> List[Dict[str, Any]]:
        """Get all messages for a chat in chronological order"""
        if not user_id:
            raise APIError('User ID is required to get messages', 400)
            
        chat = self.get_chat(chat_id, user_id)
        
        response = self.messages_table.query(
            KeyConditionExpression='chatId = :chatId',
            ExpressionAttributeValues={
                ':chatId': chat_id
            },
            ScanIndexForward=True
        )
        
        return [{
            'message': item['message'],
            'author': item['author'],
            'timestamp': item['timestamp']
        } for item in response.get('Items', [])]