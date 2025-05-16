resource "aws_sqs_queue" "file_processing_queue" {
  name                      = var.queue_name
  message_retention_seconds = 86400  # 1 day
  visibility_timeout_seconds = 900   # 15 minutes
  delay_seconds             = 0
  receive_wait_time_seconds = 20     # Enable long polling
}

# IAM role for Lambda to access SQS
resource "aws_iam_role" "sqs_lambda_role" {
  name = "${var.queue_name}-lambda-role"

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

# IAM policy for Lambda to access SQS
resource "aws_iam_role_policy" "sqs_lambda_policy" {
  name = "${var.queue_name}-lambda-policy"
  role = aws_iam_role.sqs_lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "sqs:ReceiveMessage",
          "sqs:DeleteMessage",
          "sqs:GetQueueAttributes",
          "sqs:ChangeMessageVisibility"
        ]
        Resource = aws_sqs_queue.file_processing_queue.arn
      },
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:*"
      }
    ]
  })
} 