module "lambda" {
  source            = "../../modules/lambdas"
  lambda_name       = "api-lambda"
  lambda_runtime    = "python3.9"
  lambda_handler    = "api.lambda_handler"
  lambda_role_arn   = aws_iam_role.lambda_role.arn
  lambda_source_path = "../../../apps/lambdas/api.py"
}

module "api_gateway" {
  source            = "../../modules/api_gateway"
  lambda_invoke_arn = module.lambda.lambda_arn
}
