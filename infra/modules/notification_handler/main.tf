data "archive_file" "lambda_zip" {
  type        = "zip"
  source_dir  = var.lambda_source_dir
  output_path = "${path.module}/notification_handler.zip"
}

resource "aws_cloudwatch_log_group" "notification_handler" {
  name              = "/aws/lambda/${var.environment}-notification-handler"
  retention_in_days = 14

  tags = {
    Environment = var.environment
    Service     = "notification-handler"
  }
}

resource "aws_lambda_function" "notification_handler" {
  filename         = data.archive_file.lambda_zip.output_path
  function_name    = "${var.environment}-notification-handler"
  role            = var.lambda_role_arn
  handler         = "notification_handler.lambda_handler"
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
  runtime         = "python3.9"
  timeout         = 30
  memory_size     = 128

  environment {
    variables = {
      SES_SENDER_EMAIL = var.ses_sender_email
    }
  }

  tags = {
    Environment = var.environment
    Service     = "notification-handler"
  }
}

# Allow SNS to invoke the Lambda
resource "aws_lambda_permission" "allow_sns" {
  statement_id  = "AllowExecutionFromSNS"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.notification_handler.function_name
  principal     = "sns.amazonaws.com"
  source_arn    = var.sns_topic_arn
} 