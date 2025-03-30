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
}

output "lambda_arn" {
  value = aws_lambda_function.lambda.arn
}
