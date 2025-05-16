output "queue_url" {
  description = "URL of the SQS queue"
  value       = aws_sqs_queue.file_processing_queue.url
}

output "queue_arn" {
  description = "ARN of the SQS queue"
  value       = aws_sqs_queue.file_processing_queue.arn
}

output "lambda_role_arn" {
  description = "ARN of the IAM role for Lambda to access SQS"
  value       = aws_iam_role.sqs_lambda_role.arn
} 