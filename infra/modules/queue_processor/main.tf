data "archive_file" "lambda_zip" {
  type        = "zip"
  source_file = var.lambda_source_path
  output_path = "${var.lambda_name}.zip"
}

resource "aws_lambda_function" "queue_processor" {
  function_name    = var.lambda_name
  role            = var.lambda_role_arn
  handler         = "queue_processor.lambda_handler"
  runtime         = "python3.9"
  filename        = data.archive_file.lambda_zip.output_path
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
  timeout         = 900  # 15 minutes

  environment {
    variables = {
      QUEUE_URL      = var.queue_url
      SNS_TOPIC_ARN  = var.sns_topic_arn
    }
  }
}

# CloudWatch Event Rule to trigger Lambda every minute
resource "aws_cloudwatch_event_rule" "trigger" {
  name                = "${var.lambda_name}-trigger"
  description         = "Trigger queue processor Lambda every minute"
  schedule_expression = "rate(1 minute)"
}

# CloudWatch Event Target
resource "aws_cloudwatch_event_target" "lambda_target" {
  rule      = aws_cloudwatch_event_rule.trigger.name
  target_id = "QueueProcessorLambda"
  arn       = aws_lambda_function.queue_processor.arn
}

# Lambda permission for CloudWatch Events
resource "aws_lambda_permission" "allow_cloudwatch" {
  statement_id  = "AllowCloudWatchInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.queue_processor.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.trigger.arn
} 