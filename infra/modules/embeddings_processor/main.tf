data "archive_file" "lambda_zip" {
  type        = "zip"
  source_dir  = var.lambda_source_dir
  output_path = "${path.module}/lambda.zip"
}

resource "aws_lambda_function" "embeddings_processor" {
  filename         = data.archive_file.lambda_zip.output_path
  function_name    = var.lambda_name
  role            = var.lambda_role_arn
  handler         = "embeddings_processor.lambda_handler"
  runtime         = var.lambda_runtime
  timeout         = 900  # 15 minutes
  memory_size     = 1024
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256

  environment {
    variables = {
      QUEUE_URL       = var.queue_url
      SNS_TOPIC_ARN   = var.notification_topic_arn
      KENDRA_INDEX_ID = var.kendra_index_id
      S3_BUCKET_NAME  = var.s3_bucket_name
      OPENSEARCH_ENDPOINT = var.opensearch_endpoint
      OPENSEARCH_INDEX   = var.opensearch_index
    }
  }

  layers = [var.xray_layer_arn]

  tags = {
    Name        = var.lambda_name
    Environment = var.environment
  }
}

# Add SQS trigger for the Lambda function
resource "aws_lambda_event_source_mapping" "sqs_trigger" {
  event_source_arn = var.queue_arn
  function_name    = aws_lambda_function.embeddings_processor.function_name
  batch_size       = 1
  enabled          = true
}

# Allow SQS to invoke the Lambda function
resource "aws_lambda_permission" "sqs_invoke" {
  statement_id  = "AllowSQSTrigger"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.embeddings_processor.function_name
  principal     = "sqs.amazonaws.com"
  source_arn    = var.queue_arn
} 