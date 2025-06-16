# SNS topic for file processing notifications
resource "aws_sns_topic" "file_processing" {
  name = var.topic_name
}

# Allow SNS to publish messages to itself
resource "aws_sns_topic_policy" "default" {
  arn = aws_sns_topic.file_processing.arn

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "sns.amazonaws.com"
        }
        Action = [
          "SNS:Publish"  # Allow publishing to this topic
        ]
        Resource = aws_sns_topic.file_processing.arn
      }
    ]
  })
}

# IAM policy allowing Lambda functions to publish to SNS
resource "aws_iam_role_policy" "lambda_sns_policy" {
  name = "lambda-sns-policy"
  role = var.lambda_role_id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "sns:Publish"  # Allow Lambda to publish messages
        ]
        Resource = aws_sns_topic.file_processing.arn
      }
    ]
  })
}

# Allow SNS to send messages to SQS queue
resource "aws_sqs_queue_policy" "queue_policy" {
  queue_url = var.queue_url

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "sns.amazonaws.com"
        }
        Action = [
          "sqs:SendMessage"  # Allow SNS to send messages to SQS
        ]
        Resource = var.queue_arn
        Condition = {
          ArnLike = {
            "aws:SourceArn": aws_sns_topic.file_processing.arn  # Only from our SNS topic
          }
        }
      }
    ]
  })
}

# Subscribe SQS queue to SNS topic for file processing
resource "aws_sns_topic_subscription" "queue" {
  topic_arn = aws_sns_topic.file_processing.arn
  protocol  = "sqs"  # Use SQS protocol
  endpoint  = var.queue_arn
}

# SNS topic for general notifications (e.g., processing status)
resource "aws_sns_topic" "notification_topic" {
  name = "${var.environment}-notification-topic"
}

# Allow S3 to publish to notification topic
resource "aws_sns_topic_policy" "notification_topic_policy" {
  arn = aws_sns_topic.notification_topic.arn

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "s3.amazonaws.com"  # Allow S3 to publish
        }
        Action   = "SNS:Publish"
        Resource = aws_sns_topic.notification_topic.arn
        Condition = {
          ArnLike = {
            "aws:SourceArn": var.s3_bucket_arn  # Only from our S3 bucket
          }
        }
      }
    ]
  })
}

# Subscribe notification handler Lambda to notification topic
resource "aws_sns_topic_subscription" "notification_handler" {
  topic_arn = aws_sns_topic.notification_topic.arn
  protocol  = "lambda"  # Use Lambda protocol
  endpoint  = var.notification_handler_lambda_arn
} 