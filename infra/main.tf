module "sqs" {
  source = "./modules/sqs"
  
  queue_name = "file-processing-queue"
}

module "queue_processor" {
  source = "./modules/queue_processor"
  
  lambda_name        = "file-queue-processor"
  lambda_source_path = "../apps/s3-trigger-lambda/queue_processor.py"
  lambda_role_arn    = module.sqs.lambda_role_arn
  queue_url          = module.sqs.queue_url
} 