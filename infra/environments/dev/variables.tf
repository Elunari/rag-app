variable "github_token" {
  description = "GitHub personal access token for repository access"
  type        = string
  sensitive   = true
}

variable "repository_url" {
  description = "URL of the GitHub repository"
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
  default     = "us-east-1"
}

variable "ses_sender_email" {
  description = "Email address to use as the sender for SES notifications"
  type        = string
} 