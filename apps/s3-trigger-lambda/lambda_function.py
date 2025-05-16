import json
import boto3
import os
from typing import Dict, Any

sqs = boto3.client('sqs')

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Handle S3 event and send message to SQS queue.
    """
    queue_url = os.environ['QUEUE_URL']
    
    try:
        # Send message to SQS
        response = sqs.send_message(
            QueueUrl=queue_url,
            MessageBody=json.dumps(event)
        )
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'Message sent to queue',
                'messageId': response['MessageId']
            })
        }
        
    except Exception as e:
        print(f"Error sending message to queue: {str(e)}")
        raise 