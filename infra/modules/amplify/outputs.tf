output "app_id" {
  description = "ID of the Amplify application"
  value       = aws_amplify_app.frontend.id
}

output "app_arn" {
  description = "ARN of the Amplify application"
  value       = aws_amplify_app.frontend.arn
}

output "default_domain" {
  description = "Default domain of the Amplify application"
  value       = aws_amplify_app.frontend.default_domain
}

output "branch_name" {
  description = "The name of the Amplify branch"
  value       = aws_amplify_branch.master.branch_name
}

output "app_url" {
  description = "The URL of the Amplify application"
  value       = "https://${aws_amplify_branch.master.branch_name}.${aws_amplify_app.frontend.default_domain}"
}