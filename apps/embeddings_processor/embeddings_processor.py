import json
import boto3
import os
import time
import logging
from typing import Dict, Any, List, Optional
from dataclasses import dataclass
from datetime import datetime
from opensearchpy import OpenSearch, RequestsHttpConnection
from requests_aws4auth import AWS4Auth

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

# OpenSearch configuration
opensearch_endpoint = os.environ['OPENSEARCH_ENDPOINT']
opensearch_index = os.environ['OPENSEARCH_INDEX']
region = os.environ['AWS_REGION']

# Create OpenSearch client with AWS authentication
credentials = boto3.Session().get_credentials()
auth = AWS4Auth(
    credentials.access_key,
    credentials.secret_key,
    region,
    'es',
    session_token=credentials.token
)

opensearch = OpenSearch(
    hosts=[{'host': opensearch_endpoint.replace('https://', ''), 'port': 443}],
    http_auth=auth,
    use_ssl=True,
    verify_certs=True,
    connection_class=RequestsHttpConnection
)

def create_opensearch_index():
    """Create OpenSearch index with vector search mapping if it doesn't exist."""
    try:
        # Check if index exists
        if not opensearch.indices.exists(index=opensearch_index):
            logger.info(f"Creating OpenSearch index: {opensearch_index}")
            
            # Define index mapping
            mapping = {
                "mappings": {
                    "properties": {
                        "id": { "type": "keyword" },
                        "title": { "type": "text" },
                        "content": { "type": "text" },
                        "embeddings": {
                            "type": "knn_vector",
                            "dimension": 1536,
                            "method": {
                                "name": "hnsw",
                                "space_type": "l2",
                                "engine": "nmslib"
                            }
                        },
                        "metadata": { "type": "object" },
                        "timestamp": { "type": "date" }
                    }
                },
                "settings": {
                    "index": {
                        "knn": True,
                        "knn.algo_param.ef_search": 100,
                        "knn.algo_param.ef_construction": 200,
                        "knn.algo_param.m": 16
                    }
                }
            }
            
            # Create index with mapping
            response = opensearch.indices.create(
                index=opensearch_index,
                body=mapping
            )
            logger.info(f"Created OpenSearch index: {json.dumps(response)}")
        else:
            logger.info(f"OpenSearch index {opensearch_index} already exists")
            
    except Exception as e:
        logger.error(f"Error creating OpenSearch index: {str(e)}")
        raise

# Create index when Lambda starts
create_opensearch_index()

@dataclass
class S3Object:
    bucket: str
    key: str
    content_type: Optional[str] = None

def get_s3_object(bucket: str, key: str) -> S3Object:
    """Retrieve S3 object metadata."""
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
    """Check if the file is a PDF based on content type."""
    is_pdf_file = content_type == 'application/pdf'
    logger.info(f"File content type: {content_type}, is PDF: {is_pdf_file}")
    return is_pdf_file

def extract_text_from_pdf(s3_object: S3Object) -> str:
    """Extract text from PDF document using Amazon Textract."""
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

def generate_embeddings(text: str) -> List[float]:
    """Generate embeddings using Amazon Titan."""
    try:
        logger.info("Generating embeddings with Titan")
        response = bedrock.invoke_model(
            modelId='amazon.titan-embed-text-v1',
            body=json.dumps({
                'inputText': text
            })
        )
        
        response_body = json.loads(response['body'].read())
        embeddings = response_body['embedding']
        logger.info(f"Successfully generated embeddings of length: {len(embeddings)}")
        return embeddings
    except Exception as e:
        logger.error(f"Error generating embeddings: {str(e)}")
        raise

def store_in_opensearch(text: str, embeddings: List[float], metadata: Dict[str, Any]) -> None:
    """Store text and embeddings in OpenSearch."""
    try:
        # Create a unique document ID using timestamp
        document_id = f"doc-{int(time.time())}"
        logger.info(f"Preparing to store document in OpenSearch with ID: {document_id}")
        
        # Prepare the document for OpenSearch
        document = {
            'id': document_id,
            'title': metadata.get('title', 'Untitled Document'),
            'content': text,
            'embeddings': embeddings,
            'metadata': metadata,
            'timestamp': datetime.utcnow().isoformat()
        }
        
        logger.info(f"Submitting document to OpenSearch index {opensearch_index}")
        logger.info(f"Document details: Title={document['title']}, Size={len(text)} bytes")
        
        # Submit the document to OpenSearch
        response = opensearch.index(
            index=opensearch_index,
            id=document_id,
            body=document
        )
        
        logger.info(f"OpenSearch index response: {json.dumps(response)}")
            
    except Exception as e:
        logger.error(f"Error storing in OpenSearch: {str(e)}")
        raise

def send_notification(subject: str, message: str) -> None:
    """Send a notification to SNS topic."""
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
    """Process a single file: extract text, generate embeddings, and store in OpenSearch."""
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
        
        # Generate embeddings
        embeddings = generate_embeddings(text)
        
        # Store in OpenSearch
        store_in_opensearch(text, embeddings, metadata)
        logger.info(f"Successfully stored document in OpenSearch: {filename}")

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