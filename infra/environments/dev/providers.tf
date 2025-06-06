provider "aws" {
  region = "eu-central-1"
}

provider "aws" {
  alias  = "kendra"
  region = "us-east-1"  # Kendra is only available in us-east-1
}

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}