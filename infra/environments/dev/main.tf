module "s3" {
  source      = "../../modules/s3"
  environment = "dev"
}

module "api" {
  source = "../../modules/api"

  lambda_name        = "rag-chat-api"
  lambda_runtime     = "python3.9"
  lambda_role_arn    = aws_iam_role.lambda_role.arn
  lambda_source_path = "../../../apps/api"
  s3_bucket_name     = module.s3.bucket_name
  project_name       = "rag-chat"
  kendra_index_id    = module.kendra.index_id
}

module "api_gateway" {
  source = "../../modules/api_gateway"

  api_name             = "rag-chat-api"
  stage_name          = "dev"
  lambda_invoke_arn   = module.api.lambda_invoke_arn
  lambda_function_name = module.api.lambda_function_name
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

module "notification_handler" {
  source = "../../modules/notification_handler"
  
  environment        = "dev"
  lambda_source_dir  = "../../../apps/s3-trigger-lambda"
  sns_topic_arn     = module.sns.notification_topic_arn
  ses_sender_email  = var.ses_sender_email
  lambda_role_arn   = aws_iam_role.lambda_role.arn
}

module "sns" {
  source = "../../modules/sns"
  
  topic_name                    = "file-processing-notifications-dev"
  lambda_role_id               = aws_iam_role.lambda_role.id
  queue_url                    = module.sqs.queue_url
  queue_arn                    = module.sqs.queue_arn
  environment                  = "dev"
  s3_bucket_arn               = module.s3.bucket_arn
  notification_handler_lambda_arn = module.notification_handler.lambda_function_arn
}

module "kendra" {
  source = "../../modules/kendra"

  index_name        = "knowledge-base-index-dev"
  index_description = "Knowledge Base Search Index"
  role_arn         = aws_iam_role.kendra_role.arn
  edition          = "DEVELOPER_EDITION"
  kms_key_id       = null  # Using AWS managed key
}

module "embeddings_processor" {
  source = "../../modules/embeddings_processor"
  
  lambda_name        = "embeddings-processor-dev"
  lambda_source_dir  = "../../../apps/embeddings_processor"
  lambda_role_arn    = aws_iam_role.lambda_role.arn
  queue_url          = module.sqs.queue_url
  queue_arn          = module.sqs.queue_arn
  sns_topic_arn      = module.sns.topic_arn
  notification_topic_arn = module.sns.notification_topic_arn
  kendra_index_id    = module.kendra.index_id
  s3_bucket_name     = module.s3.bucket_name
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

module "dynamodb" {
  source = "../../modules/dynamodb"

  project_name    = "rag-chat"
  environment     = "dev"
  lambda_role_arn = aws_iam_role.lambda_role.arn
}
