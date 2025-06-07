output "topic_arn" {
  description = "ARN of the SNS topic for file processing"
  value       = aws_sns_topic.file_processing.arn
}

output "notification_topic_arn" {
  description = "ARN of the SNS topic for notifications"
  value       = aws_sns_topic.notification_topic.arn
} 