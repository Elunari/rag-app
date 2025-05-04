import json
import logging

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event, context):
    logger.info("Received event: %s", json.dumps(event))
    
    # Extract bucket and key from the event
    for record in event.get('Records', []):
        if record['eventSource'] == 'aws:s3':
            bucket = record['s3']['bucket']['name']
            key = record['s3']['object']['key']
            logger.info(f"New file uploaded to S3: {bucket}/{key}")
            print(f"New file uploaded to S3: {bucket}/{key}")
    
    return {
        'statusCode': 200,
        'body': json.dumps('S3 event processed successfully!')
    } 