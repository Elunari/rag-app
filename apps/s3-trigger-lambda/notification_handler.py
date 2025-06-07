import json
import boto3
import os
import logging
from typing import Dict, Any

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# AWS Clients
ses = boto3.client('ses', region_name='us-east-1')

def send_email_notification(user_email: str, subject: str, message: str) -> None:
    """Send an email notification using Amazon SES."""
    try:
        sender_email = os.environ.get('SES_SENDER_EMAIL')
        logger.info(f"Sender email from environment: {sender_email}")
        logger.info(f"Attempting to send email to: {user_email}")
        
        if not sender_email:
            raise ValueError("SES_SENDER_EMAIL environment variable is not set")
            
        response = ses.send_email(
            Source=sender_email,
            Destination={
                'ToAddresses': [user_email]
            },
            Message={
                'Subject': {
                    'Data': subject
                },
                'Body': {
                    'Text': {
                        'Data': message
                    }
                }
            }
        )
        logger.info(f"Email sent successfully: {response['MessageId']}")
    except Exception as e:
        logger.error(f"Error sending email: {str(e)}")
        raise

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """Handle SNS notifications and send email notifications."""
    logger.info("Notification handler started")
    logger.info(f"Received event: {json.dumps(event)}")
    
    try:
        # Process each record from SNS
        for record in event['Records']:
            if record.get('EventSource') == 'aws:sns':
                message = json.loads(record['Sns']['Message'])
                logger.info(f"Processing SNS message: {json.dumps(message)}")
                
                # Extract user email and notification details
                user_email = message.get('user_email')
                status = message.get('status')
                original_filename = message.get('original_filename')
                
                if not user_email:
                    logger.warning("No user email found in message")
                    continue
                
                if status == 'success':
                    subject = "Your Document Has Been Processed Successfully"
                    message_body = f"""
                    Hello,
                    
                    Your document '{original_filename}' has been successfully processed and added to the knowledge base.
                    You can now search for and access this document through the knowledge base interface.
                    
                    Thank you for using our service!
                    """
                else:
                    subject = "Document Processing Failed"
                    message_body = f"""
                    Hello,
                    
                    We encountered an error while processing your document '{original_filename}'.
                    Error details: {message.get('message', 'Unknown error')}
                    
                    Please try uploading the document again or contact support if the issue persists.
                    
                    Thank you for your understanding.
                    """
                
                send_email_notification(user_email, subject, message_body)
                
        return {
            'statusCode': 200,
            'body': 'Successfully processed notifications'
        }
        
    except Exception as e:
        logger.error(f"Error in notification handler: {str(e)}")
        raise 