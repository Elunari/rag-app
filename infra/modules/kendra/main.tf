# AWS provider configuration for Kendra
# Kendra is only available in us-east-1 region
provider "aws" {
  alias  = "kendra"
  region = "us-east-1"
}

# Amazon Kendra index for intelligent search
resource "aws_kendra_index" "kendra_index" {
  provider = aws.kendra
  name        = var.index_name
  description = var.index_description
  role_arn    = var.role_arn  # IAM role for Kendra to access other AWS services

  edition = var.edition  # DEVELOPER_EDITION for development environment

  # Server-side encryption configuration
  server_side_encryption_configuration {
    kms_key_id = var.kms_key_id  # KMS key for encryption (null for AWS managed key)
  }

  # Lifecycle configuration to prevent Terraform from modifying certain attributes
  lifecycle {
    ignore_changes = [
      description,  # Ignore changes to description
      server_side_encryption_configuration  # Ignore changes to encryption config
    ]
  }
}

# Data sources for current AWS region and account
data "aws_region" "current" {}
data "aws_caller_identity" "current" {} 