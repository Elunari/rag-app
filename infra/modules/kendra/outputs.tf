output "index_id" {
  description = "The ID of the Kendra index"
  value       = aws_kendra_index.kendra_index.id
}

output "index_arn" {
  description = "The ARN of the Kendra index"
  value       = aws_kendra_index.kendra_index.arn
}

output "role_arn" {
  description = "The ARN of the IAM role used by Kendra"
  value       = var.role_arn
} 