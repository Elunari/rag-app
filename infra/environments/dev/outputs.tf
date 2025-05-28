output "api_url" {
  description = "The URL of the API Gateway endpoint"
  value       = module.api_gateway.api_url
}

output "amplify_app_url" {
  description = "The URL of the Amplify application"
  value       = module.amplify.app_url
}
