output "lambda_name" {
  description = "Name of the Lambda function"
  value       = aws_lambda_function.lambda.function_name
}

output "lambda_arn" {
  description = "ARN of the Lambda function"
  value       = aws_lambda_function.lambda.arn
}

output "lambda_invoke_arn" {
  description = "ARN to invoke the Lambda function"
  value       = aws_lambda_function.lambda.invoke_arn
} 