# Generate a random suffix for the bucket name to ensure uniqueness
resource "random_id" "bucket_suffix" {
  byte_length = 4  # 8 characters in hex
}

# S3 bucket for storing knowledge base documents
resource "aws_s3_bucket" "knowledge_base" {
  bucket = "knowledge-base-${var.environment}-${random_id.bucket_suffix.hex}"
}

# Enable versioning to keep track of document changes
resource "aws_s3_bucket_versioning" "knowledge_base" {
  bucket = aws_s3_bucket.knowledge_base.id
  versioning_configuration {
    status = "Enabled"  # Enable versioning
  }
}

# Configure server-side encryption for data at rest
resource "aws_s3_bucket_server_side_encryption_configuration" "knowledge_base" {
  bucket = aws_s3_bucket.knowledge_base.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"  # Use AES-256 encryption
    }
  }
}

# Block all public access to the bucket
resource "aws_s3_bucket_public_access_block" "knowledge_base" {
  bucket = aws_s3_bucket.knowledge_base.id

  block_public_acls       = true  # Block public ACLs
  block_public_policy     = true  # Block public bucket policies
  ignore_public_acls      = true  # Ignore public ACLs
  restrict_public_buckets = true  # Restrict public bucket access
}

# Output the bucket name for other modules
output "bucket_name" {
  value = aws_s3_bucket.knowledge_base.id
}

# Output the bucket ARN for IAM policies
output "bucket_arn" {
  value = aws_s3_bucket.knowledge_base.arn
} 