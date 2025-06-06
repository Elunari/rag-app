data "archive_file" "lambda_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../../../apps/api"
  output_path = "${var.lambda_name}.zip"
}

resource "aws_lambda_function" "api" {
  function_name    = var.lambda_name
  role            = var.lambda_role_arn
  handler         = "api.lambda_handler"
  runtime         = var.lambda_runtime
  filename        = data.archive_file.lambda_zip.output_path
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
  timeout         = 30

  environment {
    variables = {
      S3_BUCKET_NAME = var.s3_bucket_name
      PROJECT_NAME   = var.project_name
      KENDRA_INDEX_ID = var.kendra_index_id
    }
  }
}
