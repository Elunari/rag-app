# Create a ZIP archive of the API Lambda function code
data "archive_file" "lambda_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../../../apps/api"
  output_path = "${var.lambda_name}.zip"
}

# Main API Lambda function that handles all HTTP requests
# This function implements the following endpoints:
# - GET /chats - List user's chats
# - GET /chats/{chatId} - Get specific chat
# - POST /chats/{chatName} - Create new chat
# - GET /chats/{chatId}/messages - Get chat messages
# - POST /chats/{chatId}/messages - Send message
# - POST /add_to_knowledge_base - Upload document
resource "aws_lambda_function" "api" {
  function_name    = var.lambda_name
  role            = var.lambda_role_arn
  handler         = "api.lambda_handler"
  runtime         = var.lambda_runtime
  filename        = data.archive_file.lambda_zip.output_path
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
  timeout         = 30  # 30 seconds timeout for API requests
  layers          = [var.xray_layer_arn]  # Add X-Ray layer for tracing
  tracing_config {
    mode = "Active"  # Enable X-Ray tracing
  }

  # Environment variables for the Lambda function
  environment {
    variables = {
      S3_BUCKET_NAME = var.s3_bucket_name    # S3 bucket for storing documents
      PROJECT_NAME   = var.project_name      # Project name for resource naming
      KENDRA_INDEX_ID = var.kendra_index_id  # Kendra index for document search
    }
  }
}
