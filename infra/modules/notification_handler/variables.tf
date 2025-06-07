variable "environment" {
  description = "Environment name (e.g., dev, prod)"
  type        = string
}

variable "lambda_source_dir" {
  description = "Directory containing the Lambda function source code"
  type        = string
}

variable "sns_topic_arn" {
  description = "ARN of the SNS topic that will trigger this Lambda"
  type        = string
}

variable "ses_sender_email" {
  description = "Email address to use as the sender for SES notifications"
  type        = string
}

variable "lambda_role_arn" {
  description = "ARN of the IAM role to use for the Lambda function"
  type        = string
} 