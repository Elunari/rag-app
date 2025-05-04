data "archive_file" "lambda_zip" {
  type        = "zip"
  source_file = var.lambda_source_path
  output_path = "${var.lambda_name}.zip"
}

resource "aws_lambda_function" "lambda" {
  function_name    = var.lambda_name
  role            = var.lambda_role_arn
  handler         = var.lambda_handler
  runtime         = var.lambda_runtime
  filename        = data.archive_file.lambda_zip.output_path
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256

  environment {
    variables = {
      S3_BUCKET_NAME = var.s3_bucket_name
    }
  }
}

# Allow S3 to invoke the Lambda function
resource "aws_lambda_permission" "s3_invoke" {
  statement_id  = "AllowS3Invoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.lambda.function_name
  principal     = "s3.amazonaws.com"
  source_arn    = var.s3_bucket_arn
}

# Configure S3 bucket notification
resource "aws_s3_bucket_notification" "bucket_notification" {
  bucket = var.s3_bucket_name

  lambda_function {
    lambda_function_arn = aws_lambda_function.lambda.arn
    events             = ["s3:ObjectCreated:*"]
  }

  depends_on = [aws_lambda_permission.s3_invoke]
} 