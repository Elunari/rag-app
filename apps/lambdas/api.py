import json
import base64
import os
from datetime import datetime
import cgi
import io
import boto3
import uuid
import traceback

def lambda_handler(event, context):
    print("Received event:", json.dumps(event))
    path = event.get('path', '')
    content_type = event.get('headers', {}).get('Content-Type', '')
    try:
        if path == '/send_prompt':
            body = json.loads(event.get('body', '{}'))
            return send_prompt(body)
        elif path == '/add_to_knowledge_base':
            body = event.get('body', '')
            if event.get('isBase64Encoded', False):
                body = base64.b64decode(body)
            form = cgi.FieldStorage(
                fp=io.BytesIO(body),
                headers={'content-type': content_type},
                environ={'REQUEST_METHOD': 'POST'}
            )
            
            if 'file' in form:
                return add_to_knowledge_base(form['file'])
            else:
                return {
                    'statusCode': 400,
                    'body': json.dumps({'message': 'No file provided in form data'})
                }
                   
    except Exception as e:
        print("Error:", str(e))
        print("Traceback:", traceback.format_exc())
        return {
            'statusCode': 500,
            'body': json.dumps({'message': f'Internal server error: {str(e)}'})
        }

def send_prompt(body):
    message = body.get('prompt', '')
    
    return {
        'statusCode': 200,
        'body': json.dumps({
            'message': f'Received message: {message}',
            'timestamp': datetime.utcnow().isoformat() + 'Z'
        })
    }

def add_to_knowledge_base(file_field):
    try:
        file_data = file_field.file.read()
        original_filename = file_field.filename
        
        file_extension = os.path.splitext(original_filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        
        temp_path = os.path.join('/tmp', unique_filename)
        with open(temp_path, 'wb') as f:
            f.write(file_data)
            
        print("Initializing S3 client...")
        try:
            s3_client = boto3.client('s3')
            print("S3 client initialized successfully")
        except Exception as e:
            print(f"Failed to initialize S3 client: {str(e)}")
            print(f"Traceback: {traceback.format_exc()}")
            raise
        
        bucket_name = os.environ.get('S3_BUCKET_NAME')
        if not bucket_name:
            raise ValueError("S3_BUCKET_NAME environment variable is not set")
            
        print(f"Attempting to upload to bucket: {bucket_name}")
        
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
                    'Metadata': {
                        'original_filename': original_filename,
                        'upload_date': datetime.utcnow().isoformat()
                    }
                }
            )
            print("S3 upload completed successfully")
        except Exception as s3_error:
            print(f"S3 upload error: {str(s3_error)}")
            print(f"Error type: {type(s3_error).__name__}")
            print(f"Bucket: {bucket_name}")
            print(f"File: {temp_path}")
            print(f"Key: {unique_filename}")
            print(f"Traceback: {traceback.format_exc()}")
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
                'timestamp': datetime.utcnow().isoformat() + 'Z'
            })
        }
    except Exception as e:
        print(f"Error processing file: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        return {
            'statusCode': 500,
            'body': json.dumps({'message': f'Error processing file: {str(e)}'})
        }
    
