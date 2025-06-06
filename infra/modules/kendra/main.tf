provider "aws" {
  alias  = "kendra"
  region = "us-east-1"
}

resource "aws_kendra_index" "kendra_index" {
  provider = aws.kendra
  name        = var.index_name
  description = var.index_description
  role_arn    = var.role_arn

  edition = var.edition

  server_side_encryption_configuration {
    kms_key_id = var.kms_key_id
  }

  lifecycle {
    ignore_changes = [
      description,
      server_side_encryption_configuration
    ]
  }
}

data "aws_region" "current" {}
data "aws_caller_identity" "current" {} 