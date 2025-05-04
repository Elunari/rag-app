variable "lambda_name" {
  description = "Name of the Lambda function"
  type        = string
}

variable "lambda_runtime" {
  description = "Runtime for the Lambda function"
  type        = string
}

variable "lambda_handler" {
  description = "Handler for the Lambda function"
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
  description = "Name of the S3 bucket"
  type        = string
}

variable "s3_bucket_arn" {
  description = "ARN of the S3 bucket"
  type        = string
} 