"""
Simple tests for service functions
"""
import sys
import os
from unittest.mock import MagicMock, patch

# Add the project root directory to Python path
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..'))
sys.path.insert(0, project_root)

from apps.api.services.chat_service import ChatService
from apps.api.services.knowledge_base_service import KnowledgeBaseService

print("Testing Services...")

# Test ChatService
print("\nTesting ChatService:")
try:
    with patch('boto3.resource') as mock_resource, \
         patch('boto3.client') as mock_client, \
         patch.dict(os.environ, {
             'PROJECT_NAME': 'test-project',
             'KENDRA_INDEX_ID': 'test-index'
         }):
        # Setup mocks
        mock_table = MagicMock()
        mock_messages_table = MagicMock()
        mock_resource.return_value.Table.side_effect = [mock_table, mock_messages_table]
        
        # Create service
        chat_service = ChatService()
        
        # Test get_chats
        mock_table.query.return_value = {
            'Items': [
                {
                    'userId': 'test-user',
                    'chatId': 'chat1',
                    'title': 'Test Chat'
                }
            ]
        }
        chats = chat_service.get_chats('test-user')
        assert len(chats) == 1, f"Expected 1 chat, got {len(chats)}"
        assert chats[0]['chatId'] == 'chat1', f"Expected chat1, got {chats[0]['chatId']}"
        print("✓ ChatService.get_chats works")

        # Test create_chat
        mock_table.put_item.return_value = {}
        chat = chat_service.create_chat('New Chat', 'test-user')
        assert chat['title'] == 'New Chat', f"Expected 'New Chat', got {chat['title']}"
        assert 'chatId' in chat, "chatId not in response"
        print("✓ ChatService.create_chat works")

except Exception as e:
    print(f"✗ ChatService test failed: {str(e)}")

# Test KnowledgeBaseService
print("\nTesting KnowledgeBaseService:")
try:
    with patch('boto3.client') as mock_client, \
         patch.dict(os.environ, {
             'S3_BUCKET_NAME': 'test-bucket',
             'PROJECT_NAME': 'test-project'
         }):
        # Setup mocks
        mock_s3 = MagicMock()
        mock_client.return_value = mock_s3
        
        # Create service
        kb_service = KnowledgeBaseService()
        
        # Test add_to_knowledge_base
        mock_file = MagicMock()
        mock_file.file.read.return_value = b'test content'
        mock_file.filename = 'test.pdf'
        mock_file.type = 'application/pdf'
        
        mock_s3.upload_file.return_value = None
        result = kb_service.add_to_knowledge_base(mock_file, 'test@example.com')
        assert result['statusCode'] == 200, f"Expected 200, got {result['statusCode']}"
        print("✓ KnowledgeBaseService.add_to_knowledge_base works")

except Exception as e:
    print(f"✗ KnowledgeBaseService test failed: {str(e)}")

print("\nAll service tests completed!") 