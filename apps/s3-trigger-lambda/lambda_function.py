import json
import boto3
import os
import logging
from typing import Dict, Any

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Add a stream handler to ensure logs are sent to CloudWatch
handler = logging.StreamHandler()
handler.setFormatter(logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s'))
logger.addHandler(handler)

sqs = boto3.client('sqs')

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Handle S3 event and send message to SQS queue.
    """
    logger.info("S3 trigger Lambda started")
    logger.info(f"Received event: {json.dumps(event)}")
    
    queue_url = os.environ['QUEUE_URL']
    logger.info(f"Using queue URL: {queue_url}")
    
    try:
        # Extract S3 information from the event
        s3_info = {
            'Records': []
        }
        
        for record in event.get('Records', []):
            if 's3' in record:
                s3_record = {
                    's3': {
                        'bucket': {
                            'name': record['s3']['bucket']['name']
                        },
                        'object': {
                            'key': record['s3']['object']['key']
                        }
                    }
                }
                s3_info['Records'].append(s3_record)
        
        if not s3_info['Records']:
            logger.warning("No S3 records found in event")
            return {
                'statusCode': 400,
                'body': json.dumps({
                    'message': 'No S3 records found in event'
                })
            }
        
        # Send message to SQS with MessageAttributes to identify it as an S3 event
        logger.info(f"Sending S3 info to SQS: {json.dumps(s3_info)}")
        response = sqs.send_message(
            QueueUrl=queue_url,
            MessageBody=json.dumps(s3_info),
            MessageAttributes={
                'eventType': {
                    'DataType': 'String',
                    'StringValue': 'S3Event'
                }
            }
        )
        logger.info(f"SQS response: {json.dumps(response)}")
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'Message sent to queue',
                'messageId': response['MessageId']
            })
        }
        
    except Exception as e:
        logger.error(f"Error sending message to queue: {str(e)}")
        raise 