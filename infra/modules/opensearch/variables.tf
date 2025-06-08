variable "environment" {
  description = "Environment name (e.g., dev, prod)"
  type        = string
}

variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "lambda_role_arn" {
  description = "ARN of the Lambda role that needs access to OpenSearch"
  type        = string
}

variable "lambda_role_id" {
  description = "ID of the Lambda role that needs access to OpenSearch"
  type        = string
}

variable "master_username" {
  description = "Master username for OpenSearch domain"
  type        = string
  default     = "admin"
}

variable "master_password" {
  description = "Master password for OpenSearch domain"
  type        = string
  sensitive   = true
} 