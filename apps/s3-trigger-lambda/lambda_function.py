import json
import logging
import time

logger = logging.getLogger()
logger.setLevel(logging.INFO)

class LambdaExecutionError(Exception):
    def __init__(self, status_code, message):
        self.status_code = status_code
        self.message = message
        super().__init__(self.message)

def lambda_handler(event, context):
    logger.info("Received event: %s", json.dumps(event))
    
    try:
        # Extract bucket and key from the event
        for record in event.get('Records', []):
            if record['eventSource'] == 'aws:s3':
                bucket = record['s3']['bucket']['name']
                key = record['s3']['object']['key']
                logger.info(f"New file uploaded to S3: {bucket}/{key}")
                
                # Simulate processing delay
                time.sleep(2)
                
                return {
                    'statusCode': 200,
                    'body': json.dumps({
                        'message': f'Successfully processed {bucket}/{key}',
                        'bucket': bucket,
                        'key': key
                    })
                }
        
        # If no S3 records found
        error_message = "No S3 records found in event"
        logger.error(error_message)
        raise LambdaExecutionError(400, error_message)
        
    except LambdaExecutionError as e:
        # Re-raise the custom error
        raise e
    except Exception as e:
        logger.error(f"Unexpected error processing S3 event: {str(e)}")
        raise LambdaExecutionError(500, f"Unexpected error: {str(e)}") 