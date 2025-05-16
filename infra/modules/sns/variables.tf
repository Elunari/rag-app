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