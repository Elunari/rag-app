variable "api_name" {
  description = "Name of the API Gateway"
  type        = string
}

variable "stage_name" {
  description = "Name of the API Gateway stage"
  type        = string
  default     = "$default"
}

variable "lambda_invoke_arn" {
  description = "The ARN to invoke the Lambda function"
  type        = string
}

variable "lambda_function_name" {
  description = "The name of the Lambda function"
  type        = string
}

variable "cognito_user_pool_id" {
  description = "The ID of the Cognito User Pool"
  type        = string
}

variable "cognito_client_id" {
  description = "The ID of the Cognito App Client"
  type        = string
}

variable "aws_region" {
  description = "The AWS region"
  type        = string
}