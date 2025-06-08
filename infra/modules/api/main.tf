data "archive_file" "lambda_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../../../apps/api"
  output_path = "${var.lambda_name}.zip"
}

resource "aws_lambda_function" "api" {
  filename         = data.archive_file.lambda_zip.output_path
  function_name    = var.lambda_name
  role            = var.lambda_role_arn
  handler         = "api.lambda_handler"
  runtime         = var.lambda_runtime
  timeout         = 30
  memory_size     = 1024

  environment {
    variables = {
      S3_BUCKET_NAME     = var.s3_bucket_name
      KENDRA_INDEX_ID    = var.kendra_index_id
      OPENSEARCH_ENDPOINT = var.opensearch_endpoint
      OPENSEARCH_INDEX   = var.opensearch_index
      PROJECT_NAME       = var.project_name
    }
  }

  layers = [var.xray_layer_arn]

  tags = {
    Name        = var.lambda_name
    Environment = "dev"
  }
}
