provider "aws" {
  region = "us-east-1"
}

provider "aws" {
  alias  = "kendra"
  region = "us-east-1"
}

provider "aws" {
  alias  = "us-east-1"
  region = "us-east-1" 
}

provider "aws" {
  alias  = "eu-central-1"
  region = "eu-central-1" 
}

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    null = {
      source  = "hashicorp/null"
      version = "~> 3.0"
    }
  }
  backend "s3" {
    bucket         = "infra-dev-02"
    key            = "global/s3/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "infra-state-lock-01"
    encrypt        = true # Enable encryption
  }
}