import boto3
import os
from typing import Dict, Any
import uuid
from datetime import datetime
import traceback
import json


class KnowledgeBaseService:
    def __init__(self):
        self.s3 = boto3.client('s3')
        self.bucket_name = os.environ['S3_BUCKET_NAME']
        self.project_name = os.environ['PROJECT_NAME']

    def add_to_knowledge_base(self, file_field, user_email: str = None):
        try:
            file_data = file_field.file.read()
            original_filename = file_field.filename
            
            file_extension = os.path.splitext(original_filename)[1]
            unique_filename = f"{uuid.uuid4()}{file_extension}"
            
            temp_path = os.path.join('/tmp', unique_filename)
            with open(temp_path, 'wb') as f:
                f.write(file_data)
                
            try:
                s3_client = boto3.client('s3')
            except Exception as e:
                raise
            
            bucket_name = os.environ.get('S3_BUCKET_NAME')
            if not bucket_name:
                raise ValueError("S3_BUCKET_NAME environment variable is not set")
                
            # Prepare metadata
            metadata = {
                'original_filename': original_filename,
                'upload_date': datetime.utcnow().isoformat()
            }
            
            # Only add user_email to metadata if it's provided
            if user_email:
                metadata['user_email'] = user_email
                print(f"Adding user email to metadata: {user_email}")
            else:
                print("No user email provided, skipping email notification")
            
            try:
                print(f"File size: {os.path.getsize(temp_path)} bytes")
                print(f"File exists: {os.path.exists(temp_path)}")
                print(f"File permissions: {oct(os.stat(temp_path).st_mode)[-3:]}")
                
                print("Starting S3 upload...")
                s3_client.upload_file(
                    temp_path,
                    bucket_name,
                    unique_filename,
                    ExtraArgs={
                        'ContentType': file_field.type or 'application/pdf',
                        'Metadata': metadata
                    }
                )
            except Exception as s3_error:
                raise s3_error
            
            # Clean up temporary file
            os.remove(temp_path)
            
            return {
                'statusCode': 200,
                'body': json.dumps({
                    'message': f'Successfully uploaded file to S3',
                    'original_filename': original_filename,
                    's3_key': unique_filename,
                    'bucket': bucket_name,
                    'timestamp': datetime.utcnow().isoformat() + 'Z',
                    'user_email': user_email
                })
            }
        except Exception as e:
            print(f"Error processing file: {str(e)}")
            print(f"Traceback: {traceback.format_exc()}")
            return {
                'statusCode': 500,
                'body': json.dumps({'message': f'Error processing file: {str(e)}'})
            }