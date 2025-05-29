variable "app_name" {
  description = "Name of the Amplify application"
  type        = string
}

variable "repository_url" {
  description = "URL of the GitHub repository"
  type        = string
}

variable "github_token" {
  description = "GitHub personal access token for repository access"
  type        = string
  sensitive   = true
}

variable "backend_url" {
  description = "Backend API URL for the frontend application"
  type        = string
}

variable "domain_name" {
  description = "Custom domain name for the application (optional)"
  type        = string
  default     = null
}

variable "aws_region" {
  description = "AWS region where resources are deployed"
  type        = string
}

variable "user_pool_id" {
  description = "Cognito User Pool ID"
}

variable "user_pool_client_id" {
  description = "Cognito User Pool Client ID"
  type        = string
} 