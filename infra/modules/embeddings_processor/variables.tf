variable "lambda_name" {
  description = "Name of the Lambda function"
  type        = string
}

variable "lambda_runtime" {
  description = "Runtime for the Lambda function"
  type        = string
  default     = "python3.9"
}

variable "lambda_role_arn" {
  description = "ARN of the IAM role for the Lambda function"
  type        = string
}

variable "lambda_source_dir" {
  description = "Directory containing the Lambda function source code"
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

variable "sns_topic_arn" {
  description = "ARN of the SNS topic"
  type        = string
}

variable "notification_topic_arn" {
  description = "ARN of the notification SNS topic"
  type        = string
}

variable "kendra_index_id" {
  description = "ID of the Kendra index"
  type        = string
}

variable "s3_bucket_name" {
  description = "Name of the S3 bucket"
  type        = string
}

variable "environment" {
  description = "Environment name (e.g., dev, prod)"
  type        = string
}

variable "opensearch_endpoint" {
  description = "OpenSearch domain endpoint"
  type        = string
}

variable "opensearch_index" {
  description = "OpenSearch index name"
  type        = string
  default     = "knowledge-base"
}

variable "xray_layer_arn" {
  description = "ARN of the X-Ray SDK Lambda layer"
  type        = string
}