variable "topic_name" {
  description = "Name of the SNS topic"
  type        = string
}

variable "lambda_role_id" {
  description = "ID of the Lambda IAM role"
  type        = string
}

variable "queue_url" {
  description = "URL of the SQS queue"
  type        = string
}

variable "queue_arn" {
  description = "ARN of the SQS queue"
  type        = string
}

variable "environment" {
  description = "Environment name (e.g., dev, prod)"
  type        = string
}

variable "s3_bucket_arn" {
  description = "ARN of the S3 bucket that will publish to this topic"
  type        = string
}

variable "notification_handler_lambda_arn" {
  description = "ARN of the notification handler Lambda function"
  type        = string
} 