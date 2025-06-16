import json
import boto3
import os
import time
import logging
from typing import Dict, Any, List, Optional
from dataclasses import dataclass
from datetime import datetime

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Add a stream handler to ensure logs are sent to CloudWatch
handler = logging.StreamHandler()
handler.setFormatter(logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s'))
logger.addHandler(handler)

# Log that the Lambda is starting
logger.info("Lambda function starting")

# AWS Clients
sqs = boto3.client('sqs')
s3 = boto3.client('s3')
sns = boto3.client('sns')
textract = boto3.client('textract')
bedrock = boto3.client('bedrock-runtime')
kendra = boto3.client('kendra', region_name='us-east-1')

kendra_index_id = os.environ['KENDRA_INDEX_ID']
logger.info(f"Using Kendra index ID: {kendra_index_id}")

@dataclass
class S3Object:
    """
    Data class representing an S3 object with its metadata.
    Used to pass S3 object information between functions.
    
    Attributes:
        bucket: S3 bucket name
        key: S3 object key
        content_type: MIME type of the object (optional)
    """
    bucket: str
    key: str
    content_type: Optional[str] = None

def get_s3_object(bucket: str, key: str) -> S3Object:
    """
    Retrieve metadata for an S3 object.
    
    Args:
        bucket: S3 bucket name
        key: S3 object key
        
    Returns:
        S3Object: Object containing bucket, key, and content type
        
    Raises:
        Exception: If S3 head_object fails
    """
    try:
        logger.info(f"Getting S3 object metadata for bucket: {bucket}, key: {key}")
        response = s3.head_object(Bucket=bucket, Key=key)
        return S3Object(
            bucket=bucket,
            key=key,
            content_type=response.get('ContentType')
        )
    except Exception as e:
        logger.error(f"Error retrieving S3 object metadata: {str(e)}")
        raise

def is_pdf(content_type: Optional[str]) -> bool:
    """
    Check if a file is a PDF based on its content type.
    
    Args:
        content_type: MIME type of the file
        
    Returns:
        bool: True if file is a PDF, False otherwise
    """
    is_pdf_file = content_type == 'application/pdf'
    logger.info(f"File content type: {content_type}, is PDF: {is_pdf_file}")
    return is_pdf_file

def extract_text_from_pdf(s3_object: S3Object) -> str:
    """
    Extract text from a PDF document using Amazon Textract.
    Uses asynchronous document analysis to handle large PDFs.
    
    Args:
        s3_object: S3Object containing PDF file information
        
    Returns:
        str: Extracted text from the PDF
        
    Raises:
        ValueError: If file is not a PDF
        Exception: If Textract job fails
    """
    if not is_pdf(s3_object.content_type):
        raise ValueError(f"File {s3_object.key} is not a PDF. Content type: {s3_object.content_type}")
    
    try:
        logger.info(f"Starting Textract job for file: {s3_object.key}")
        response = textract.start_document_analysis(
            DocumentLocation={
                'S3Object': {
                    'Bucket': s3_object.bucket,
                    'Name': s3_object.key
                }
            },
            FeatureTypes=['TABLES', 'FORMS']
        )
        
        job_id = response['JobId']
        logger.info(f"Textract job started with ID: {job_id}")
        
        # Poll for job completion
        while True:
            response = textract.get_document_analysis(JobId=job_id)
            status = response['JobStatus']
            logger.info(f"Textract job status: {status}")
            
            if status in ['SUCCEEDED', 'FAILED']:
                break
                
            time.sleep(5)
        
        if status == 'FAILED':
            error_msg = f"Textract job failed: {response.get('StatusMessage', 'Unknown error')}"
            logger.error(error_msg)
            raise Exception(error_msg)
        
        # Collect all text blocks
        text_blocks = []
        next_token = None
        
        while True:
            if next_token:
                response = textract.get_document_analysis(
                    JobId=job_id,
                    NextToken=next_token
                )
            else:
                response = textract.get_document_analysis(JobId=job_id)
            
            for block in response['Blocks']:
                if block['BlockType'] == 'LINE':
                    text_blocks.append(block['Text'])
            
            next_token = response.get('NextToken')
            if not next_token:
                break
        
        extracted_text = '\n'.join(text_blocks)
        logger.info(f"Successfully extracted {len(text_blocks)} text blocks from PDF")
        return extracted_text
        
    except Exception as e:
        logger.error(f"Error extracting text with Textract: {str(e)}")
        raise

def store_in_kendra(text: str, metadata: Dict[str, Any]) -> None:
    """
    Store extracted text in Amazon Kendra index.
    Creates a unique document ID using timestamp.
    
    Args:
        text: Extracted text to store
        metadata: Document metadata including title
        
    Raises:
        Exception: If Kendra batch_put_document fails
    """
    try:
        # Create a unique document ID using timestamp
        document_id = f"doc-{int(time.time())}"
        logger.info(f"Preparing to store document in Kendra with ID: {document_id}")
        
        # Prepare the document for Kendra
        document = {
            'Id': document_id,
            'Title': metadata.get('title', 'Untitled Document'),
            'Blob': text.encode('utf-8')
        }
        
        logger.info(f"Submitting document to Kendra index {kendra_index_id}")
        logger.info(f"Document details: Title={document['Title']}, Size={len(text)} bytes")
        
        # Submit the document to Kendra
        response = kendra.batch_put_document(
            IndexId=kendra_index_id,
            Documents=[document]
        )
        
        logger.info(f"Kendra batch_put_document response: {json.dumps(response)}")
            
    except Exception as e:
        logger.error(f"Error storing in Kendra: {str(e)}")
        raise

def send_notification(subject: str, message: str) -> None:
    """
    Send a notification to SNS topic.
    Used to notify users about document processing status.
    
    Args:
        subject: Email subject
        message: Email message body
        
    Raises:
        Exception: If SNS publish fails
    """
    try:
        logger.info(f"Sending notification: {subject}")
        sns.publish(
            TopicArn=os.environ['SNS_TOPIC_ARN'],
            Subject=subject,
            Message=message
        )
    except Exception as e:
        logger.error(f"Error sending notification: {str(e)}")

def process_file(bucket: str, key: str) -> Dict[str, Any]:
    """
    Process a single file: extract text and store in Kendra.
    Main processing function that orchestrates the workflow:
    1. Extract text from PDF using Textract
    2. Store text in Kendra
    3. Send notifications about processing status
    
    Args:
        bucket: S3 bucket name
        key: S3 object key
        
    Returns:
        Dict: Processing status and message
        
    Raises:
        Exception: If any step in the process fails
    """
    try:
        logger.info(f"Starting to process file: {key} from bucket: {bucket}")
        send_notification(
            subject="File Processing Started",
            message=f"Started processing file: {key}"
        )
        
        s3_object = get_s3_object(bucket, key)

        text = extract_text_from_pdf(s3_object)
        logger.info(f"Successfully extracted text from PDF, length: {len(text)} characters")
        
        # Get object metadata from S3
        response = s3.head_object(Bucket=bucket, Key=key)
        metadata = response.get('Metadata', {})
        
        # Log metadata for debugging
        logger.info(f"S3 object metadata: {json.dumps(metadata)}")
        
        # Extract filename from the key (remove path if present)
        filename = key.split('/')[-1]
        
        # Get user email from metadata, log if not found
        user_email = metadata.get('user_email')
        if not user_email:
            logger.warning(f"No user_email found in metadata for file {key}")
            # Don't send notification if no user email
            return {
                'statusCode': 200,
                'body': json.dumps({
                    'status': 'success',
                    'message': f"Successfully processed file: {key}",
                    'note': 'No notification sent - missing user email'
                })
            }
        
        store_in_kendra(text, metadata)
        logger.info(f"Successfully stored document in Kendra: {filename}")

        # Send success notification to SNS
        success_message = {
            'status': 'success',
            'message': f"Successfully processed file: {key}",
            'user_email': user_email,
            'original_filename': metadata.get('original_filename', filename),
            'document_id': f"doc-{int(time.time())}"
        }
        
        send_notification(
            subject="File Processing Completed",
            message=json.dumps(success_message)
        )
        
        return {
            'statusCode': 200,
            'body': json.dumps(success_message)
        }
    except Exception as e:
        error_message = f"Error processing file {key}: {str(e)}"
        logger.error(error_message)
        
        # Get user email from metadata for error notification
        user_email = metadata.get('user_email')
        if not user_email:
            logger.warning(f"No user_email found in metadata for error notification for file {key}")
            return {
                'statusCode': 500,
                'body': json.dumps({
                    'status': 'error',
                    'message': error_message,
                    'note': 'No notification sent - missing user email'
                })
            }
        
        # Send error notification to SNS
        error_notification = {
            'status': 'error',
            'message': error_message,
            'user_email': user_email,
            'original_filename': metadata.get('original_filename', key)
        }
        
        send_notification(
            subject="File Processing Failed",
            message=json.dumps(error_notification)
        )
        
        raise

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """Process messages from SQS queue."""
    logger.info("Lambda handler started")
    logger.info(f"Received event: {json.dumps(event)}")
    
    try:
        # Process each record from SQS
        if 'Records' in event:
            logger.info(f"Found {len(event['Records'])} records to process")
            for record in event['Records']:
                logger.info(f"Processing record: {json.dumps(record)}")
                
                # Check if this is an S3 event (has MessageAttributes)
                if 'messageAttributes' in record and 'eventType' in record['messageAttributes']:
                    event_type = record['messageAttributes']['eventType']['stringValue']
                    if event_type == 'S3Event':
                        # This is our S3 event, process it directly
                        try:
                            message_body = json.loads(record['body'])
                            logger.info(f"Processing S3 event: {json.dumps(message_body)}")
                            
                            if 'Records' in message_body:
                                for s3_record in message_body['Records']:
                                    if 's3' in s3_record:
                                        bucket = s3_record['s3']['bucket']['name']
                                        key = s3_record['s3']['object']['key']
                                        logger.info(f"Processing file from bucket: {bucket}, key: {key}")
                                        
                                        result = process_file(bucket, key)
                                        return result
                        except json.JSONDecodeError as e:
                            logger.error(f"Failed to parse S3 event message body: {str(e)}")
                            continue
                else:
                    logger.info("Skipping non-S3 event message")
                    continue
        else:
            logger.warning(f"Unexpected event format: {event}")
            return {
                'statusCode': 400,
                'body': 'Invalid event format'
            }
        
    except Exception as e:
        logger.error(f"Error in lambda_handler: {str(e)}")
        logger.error(f"Event that caused error: {json.dumps(event)}")
        raise 