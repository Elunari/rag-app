# Create a ZIP archive of the Lambda function code
data "archive_file" "lambda_zip" {
  type        = "zip"
  source_dir  = var.lambda_source_dir
  output_path = "${path.module}/lambda.zip"
}

# Lambda function for processing documents and storing them in Kendra
resource "aws_lambda_function" "embeddings_processor" {
  filename         = data.archive_file.lambda_zip.output_path
  function_name    = var.lambda_name
  role            = var.lambda_role_arn
  handler         = "embeddings_processor.lambda_handler"
  runtime         = "python3.9"
  timeout         = 300  # 5 minutes timeout for processing large documents
  memory_size     = 1024 # 1GB memory for Textract and Kendra operations
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256

  # Environment variables for the Lambda function
  environment {
    variables = {
      QUEUE_URL       = var.queue_url        # SQS queue for receiving document processing requests
      SNS_TOPIC_ARN   = var.notification_topic_arn  # SNS topic for sending notifications
      KENDRA_INDEX_ID = var.kendra_index_id  # Kendra index for storing processed documents
      S3_BUCKET_NAME  = var.s3_bucket_name   # S3 bucket containing the documents
    }
  }
}

# Configure SQS trigger to automatically invoke the Lambda function
resource "aws_lambda_event_source_mapping" "sqs_trigger" {
  event_source_arn = var.queue_arn
  function_name    = aws_lambda_function.embeddings_processor.function_name
  batch_size       = 1  # Process one message at a time
  enabled          = true
}

# IAM permission to allow SQS to invoke the Lambda function
resource "aws_lambda_permission" "sqs_invoke" {
  statement_id  = "AllowSQSTrigger"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.embeddings_processor.function_name
  principal     = "sqs.amazonaws.com"
  source_arn    = var.queue_arn
} 