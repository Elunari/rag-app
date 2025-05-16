import json
import boto3
import os
import time
from typing import Dict, Any

sqs = boto3.client('sqs')
s3 = boto3.client('s3')
sns = boto3.client('sns')

def send_notification(subject: str, message: str) -> None:
    """
    Send a notification to SNS topic.
    """
    try:
        sns.publish(
            TopicArn=os.environ['SNS_TOPIC_ARN'],
            Subject=subject,
            Message=message
        )
    except Exception as e:
        print(f"Error sending notification: {str(e)}")

def process_file(bucket: str, key: str) -> Dict[str, Any]:
    """
    Process a single file from S3.
    This is where your actual file processing logic will go.
    """
    try:
        # Send start notification
        send_notification(
            subject="File Processing Started",
            message=f"Started processing file: {key}"
        )
        
        # Simulate processing delay
        time.sleep(10)
        
        # Get the file from S3
        response = s3.get_object(Bucket=bucket, Key=key)
        # Read the file content as binary
        content = response['Body'].read()
        
        # TODO: Add your actual file processing logic here
        # For now, we'll just print the file size
        file_size = len(content)
        print(f"Processing file: {key}, size: {file_size} bytes")
        
        # Send success notification
        send_notification(
            subject="File Processing Completed",
            message=f"Successfully processed file: {key} (size: {file_size} bytes)"
        )
        
        return {
            'statusCode': 200,
            'body': f'Successfully processed file: {key} (size: {file_size} bytes)'
        }
    except Exception as e:
        error_message = f"Error processing file {key}: {str(e)}"
        print(error_message)
        
        # Send error notification
        send_notification(
            subject="File Processing Failed",
            message=error_message
        )
        
        raise

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Process messages from SQS queue.
    """
    queue_url = os.environ['QUEUE_URL']
    
    try:
        # Receive message from SQS
        response = sqs.receive_message(
            QueueUrl=queue_url,
            MaxNumberOfMessages=1,
            WaitTimeSeconds=20
        )
        
        if 'Messages' not in response:
            return {
                'statusCode': 200,
                'body': 'No messages to process'
            }
        
        for message in response['Messages']:
            try:
                # Parse message body
                body = json.loads(message['Body'])
                bucket = body['Records'][0]['s3']['bucket']['name']
                key = body['Records'][0]['s3']['object']['key']
                
                # Process the file
                result = process_file(bucket, key)
                
                # Delete message from queue after successful processing
                sqs.delete_message(
                    QueueUrl=queue_url,
                    ReceiptHandle=message['ReceiptHandle']
                )
                
                return result
                
            except Exception as e:
                print(f"Error processing message: {str(e)}")
                # Don't delete the message so it can be retried
                raise
        
    except Exception as e:
        print(f"Error in lambda_handler: {str(e)}")
        raise 