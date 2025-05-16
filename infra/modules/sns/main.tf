resource "aws_sns_topic" "file_processing" {
  name = var.topic_name
}

# Allow SNS to send messages to SQS
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
          "SNS:Publish"
        ]
        Resource = aws_sns_topic.file_processing.arn
      }
    ]
  })
}

# IAM policy for Lambda to publish to SNS
resource "aws_iam_role_policy" "lambda_sns_policy" {
  name = "lambda-sns-policy"
  role = var.lambda_role_id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "sns:Publish"
        ]
        Resource = aws_sns_topic.file_processing.arn
      }
    ]
  })
}

# Allow SNS to send messages to SQS
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
          "sqs:SendMessage"
        ]
        Resource = var.queue_arn
        Condition = {
          ArnLike = {
            "aws:SourceArn": aws_sns_topic.file_processing.arn
          }
        }
      }
    ]
  })
}

# Subscribe SQS queue to SNS topic
resource "aws_sns_topic_subscription" "queue" {
  topic_arn = aws_sns_topic.file_processing.arn
  protocol  = "sqs"
  endpoint  = var.queue_arn
} 