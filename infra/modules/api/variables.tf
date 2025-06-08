variable "lambda_name" {
  description = "Name of the Lambda function"
  type        = string
}

variable "lambda_runtime" {
  description = "Runtime for the Lambda function"
  type        = string
}

variable "lambda_role_arn" {
  description = "ARN of the IAM role for the Lambda function"
  type        = string
}

variable "lambda_source_path" {
  description = "Path to the Lambda function source code"
  type        = string
}

variable "s3_bucket_name" {
  description = "Name of the S3 bucket for storing documents"
  type        = string
}

variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "kendra_index_id" {
  description = "ID of the Kendra index"
  type        = string
}

variable "xray_layer_arn" {
  description = "ARN of the X-Ray SDK Lambda layer"
  type        = string
}

variable "opensearch_endpoint" {
  description = "OpenSearch domain endpoint"
  type        = string
}

variable "opensearch_index" {
  description = "OpenSearch index name"
  type        = string
}