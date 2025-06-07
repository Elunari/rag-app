import json
import io
import logging
from typing import Dict, Any

from services.chat_service import ChatService
from services.knowledge_base_service import KnowledgeBaseService
from utils.response import create_response, error_response
from utils.errors import APIError
import cgi
import base64

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

def get_user_id(event: Dict[str, Any]) -> str:
    """Extract user ID from the event"""
    claims = event.get('requestContext', {}).get('authorizer', {}).get('claims', {})
    user_id = claims.get('sub')
    if not user_id:
        raise APIError('Unauthorized', 401)
    return user_id

def get_user_email(event: Dict[str, Any]) -> str:
    """Extract user email from the event"""
    claims = event.get('requestContext', {}).get('authorizer', {}).get('claims', {})
    email = claims.get('email')
    if not email:
        logger.warning("No email found in claims")
    return email

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """Main Lambda handler function"""
    try:
        logger.info(f"Received event: {json.dumps(event)}")
        
        http_method = event.get('httpMethod', '')
        path = event.get('path', '')
        
        logger.info(f"Method: {http_method}, Path: {path}")
        
        path = path.strip('/')
        logger.info(f"Normalized path: {path}")
        
        chat_service = ChatService()
        kb_service = KnowledgeBaseService()
        
        user_id = None
        user_email = None
        if path.startswith('chats') or path == 'add_to_knowledge_base':
            try:
                user_id = get_user_id(event)
                user_email = get_user_email(event)
                logger.info(f"User ID: {user_id}, Email: {user_email}")
            except APIError as e:
                logger.error(f"Authentication error: {str(e)}")
                raise
        
        if path == 'chats' and http_method == 'GET':
            logger.info("Handling GET /chats request")
            chats = chat_service.get_chats(user_id)
            return create_response(chats)
        
        elif path.startswith('chats/') and path.endswith('/messages') and http_method == 'GET':
            logger.info(f"Handling GET /chats/{path.split('/')[-2]}/messages request")
            chat_id = path.split('/')[-2]
            messages = chat_service.get_messages(chat_id, user_id)
            return create_response(messages)
        
        elif path.startswith('chats/') and path.endswith('/messages') and http_method == 'POST':
            logger.info(f"Handling POST /chats/{path.split('/')[-2]}/messages request")
            chat_id = path.split('/')[-2]
            data = json.loads(event.get('body', '{}'))
            message = chat_service.send_message(
                chat_id,
                data.get('content', ''),
                user_id,
            )
            return create_response(message)
            
        elif path.startswith('chats/') and http_method == 'POST':
            logger.info("Handling POST /chats request")
            chat_name = path.split('/')[-1]
            chat = chat_service.create_chat(chat_name, user_id)
            return create_response(chat, 201)
            
        elif path.startswith('chats/') and http_method == 'GET':
            logger.info(f"Handling GET /chats/{path.split('/')[-1]} request")
            chat_id = path.split('/')[-1]
            chat = chat_service.get_chat(chat_id, user_id)
            return create_response(chat)
            
        elif path == 'add_to_knowledge_base' and http_method == 'POST':
            logger.info("Handling POST /add_to_knowledge_base request")
            content_type = event.get('headers', {}).get('Content-Type', '')
            body = event.get('body', '')
            if event.get('isBase64Encoded', False):
                body = base64.b64decode(body)
            form = cgi.FieldStorage(
                fp=io.BytesIO(body),
                headers={'content-type': content_type},
                environ={'REQUEST_METHOD': 'POST'}
            )
            result = kb_service.add_to_knowledge_base(
                form['file'],
                user_email
            )
            return create_response(result)
            
        else:
            logger.warning(f"No route found for {http_method} {path}")
            return create_response({'error': 'Not found'}, 404)
            
    except APIError as e:
        logger.error(f"API Error: {str(e)}")
        return error_response(e)
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return error_response(e)
    
