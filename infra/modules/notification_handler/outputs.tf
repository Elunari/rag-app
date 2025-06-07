output "lambda_function_name" {
  description = "Name of the notification handler Lambda function"
  value       = aws_lambda_function.notification_handler.function_name
}

output "lambda_function_arn" {
  description = "ARN of the notification handler Lambda function"
  value       = aws_lambda_function.notification_handler.arn
} 