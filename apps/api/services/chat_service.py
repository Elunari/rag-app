import os
from datetime import datetime
from typing import Dict, Any, List
import boto3
import uuid
import time
from utils.errors import APIError

class ChatService:
    def __init__(self):
        self.dynamodb = boto3.resource('dynamodb')
        self.table = self.dynamodb.Table(f"{os.environ['PROJECT_NAME']}-chats")
        self.messages_table = self.dynamodb.Table(f"{os.environ['PROJECT_NAME']}-messages")
    
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

        time.sleep(2)
        
        ai_response = {
            'chatId': chat_id,
            'messageId': f"msg_{now + 1}_assistant",
            'userId': user_id,
            'author': 'assistant',
            'message': f"I'm a mock AI assistant. I received your message: '{content}'. This is a simulated response.",
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