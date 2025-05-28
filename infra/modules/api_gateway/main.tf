resource "aws_apigatewayv2_api" "api" {
  name          = "lambda-api"
  protocol_type = "HTTP"
  cors_configuration {
    allow_origins = ["*"]  # In production, you should restrict this to your Amplify domain
    allow_methods = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    allow_headers = ["Content-Type", "Authorization", "X-Amz-Date", "X-Api-Key", "X-Amz-Security-Token"]
    max_age       = 300
  }
}

resource "aws_apigatewayv2_integration" "lambda_integration" {
  api_id           = aws_apigatewayv2_api.api.id
  integration_type = "AWS_PROXY"
  integration_uri  = var.lambda_invoke_arn
}

resource "aws_apigatewayv2_route" "default_route" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "GET /"
  target    = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
}

resource "aws_apigatewayv2_route" "send_prompt_route" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "POST /send_prompt"
  target    = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
}

resource "aws_apigatewayv2_route" "add_to_knowledge_base_route" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "POST /add_to_knowledge_base"
  target    = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
}

resource "aws_apigatewayv2_stage" "api_stage" {
  api_id      = aws_apigatewayv2_api.api.id
  name        = "$default"
  auto_deploy = true
}

output "api_url" {
  value = aws_apigatewayv2_api.api.api_endpoint
}

resource "aws_lambda_permission" "api_gw" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = var.lambda_function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.api.execution_arn}/*/*"
}
