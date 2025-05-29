module "s3" {
  source      = "../../modules/s3"
  environment = "dev"
}

module "lambda" {
  source            = "../../modules/lambdas"
  lambda_name       = "api-lambda"
  lambda_runtime    = "python3.9"
  lambda_handler    = "api.lambda_handler"
  lambda_role_arn   = aws_iam_role.lambda_role.arn
  lambda_source_path = "../../../apps/lambdas/api.py"
  s3_bucket_name    = module.s3.bucket_name
}

module "api_gateway" {
  source = "../../modules/api_gateway"

  api_name             = "rag-chat-api"
  stage_name          = "dev"
  lambda_invoke_arn   = module.lambda.lambda_invoke_arn
  lambda_function_name = module.lambda.lambda_function_name
  cognito_user_pool_id = module.cognito.user_pool_id
  cognito_client_id    = module.cognito.user_pool_client_id
  aws_region          = var.aws_region
}

module "s3_trigger_lambda" {
  source = "../../modules/s3_trigger_lambda"
  
  lambda_name        = "s3-trigger-lambda-dev"
  lambda_source_path = "../../../apps/s3-trigger-lambda/lambda_function.py"
  lambda_handler     = "lambda_function.lambda_handler"
  lambda_runtime     = "python3.9"
  lambda_role_arn    = aws_iam_role.lambda_role.arn
  s3_bucket_name     = module.s3.bucket_name
  s3_bucket_arn      = module.s3.bucket_arn
  queue_url          = module.sqs.queue_url
}

module "sqs" {
  source = "../../modules/sqs"
  
  queue_name = "file-processing-queue-dev"
}

module "sns" {
  source = "../../modules/sns"
  
  topic_name     = "file-processing-notifications-dev"
  lambda_role_id = aws_iam_role.lambda_role.id
  queue_url     = module.sqs.queue_url
  queue_arn     = module.sqs.queue_arn
}

module "queue_processor" {
  source = "../../modules/queue_processor"
  
  lambda_name        = "file-queue-processor-dev"
  lambda_source_path = "../../../apps/s3-trigger-lambda/queue_processor.py"
  lambda_role_arn    = aws_iam_role.lambda_role.arn
  queue_url          = module.sqs.queue_url
  sns_topic_arn      = module.sns.topic_arn
}

module "cognito" {
  source = "../../modules/cognito"

  user_pool_name = "rag-chat-user-pool"
  app_domain     = "master.djhjyu4g8gyz0.amplifyapp.com"
}

module "amplify" {
  source = "../../modules/amplify"

  app_name       = "rag-chat-frontend-dev"
  repository_url = var.repository_url
  github_token   = var.github_token
  backend_url    = module.api_gateway.api_url
  aws_region     = var.aws_region
  domain_name    = var.domain_name
  user_pool_id   = module.cognito.user_pool_id
  user_pool_client_id = module.cognito.user_pool_client_id
}
