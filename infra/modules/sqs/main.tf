# SQS queue for managing document processing tasks
resource "aws_sqs_queue" "file_processing_queue" {
  name                      = var.queue_name
  message_retention_seconds = 86400  # Keep messages for 1 day
  visibility_timeout_seconds = 900   # Hide message for 15 minutes while processing
  delay_seconds             = 0      # No initial delay
  receive_wait_time_seconds = 20     # Enable long polling to reduce API calls
}

# IAM role for Lambda functions to access SQS
resource "aws_iam_role" "sqs_lambda_role" {
  name = "${var.queue_name}-lambda-role"

  # Trust policy allowing Lambda to assume this role
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

# IAM policy granting permissions to access SQS and CloudWatch Logs
resource "aws_iam_role_policy" "sqs_lambda_policy" {
  name = "${var.queue_name}-lambda-policy"
  role = aws_iam_role.sqs_lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "sqs:ReceiveMessage",      # Receive messages from queue
          "sqs:DeleteMessage",       # Delete processed messages
          "sqs:GetQueueAttributes",  # Get queue configuration
          "sqs:ChangeMessageVisibility"  # Extend message processing time
        ]
        Resource = aws_sqs_queue.file_processing_queue.arn
      },
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",    # Create CloudWatch log groups
          "logs:CreateLogStream",   # Create log streams
          "logs:PutLogEvents"       # Write log events
        ]
        Resource = "arn:aws:logs:*:*:*"  # Allow logging in any region
      }
    ]
  })
} 