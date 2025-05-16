data "archive_file" "lambda_zip" {
  type        = "zip"
  source_file = var.lambda_source_path
  output_path = "${var.lambda_name}.zip"
}

data "archive_file" "bridge_lambda_zip" {
  type        = "zip"
  source_file = "../../../apps/s3-trigger-lambda/bridge_lambda.py"
  output_path = "${var.lambda_name}-bridge.zip"
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
      QUEUE_URL      = var.queue_url
    }
  }
}

# Bridge Lambda function
resource "aws_lambda_function" "bridge_lambda" {
  function_name    = "${var.lambda_name}-bridge"
  role            = var.lambda_role_arn
  handler         = "bridge_lambda.lambda_handler"
  runtime         = "python3.9"
  filename        = data.archive_file.bridge_lambda_zip.output_path
  source_code_hash = data.archive_file.bridge_lambda_zip.output_base64sha256

  environment {
    variables = {
      STATE_MACHINE_ARN = aws_sfn_state_machine.state_machine.arn
    }
  }
}

# IAM role for Step Function
resource "aws_iam_role" "step_function_role" {
  name = "${var.lambda_name}-step-function-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "states.amazonaws.com"
        }
      }
    ]
  })
}

# IAM policy for Step Function to invoke Lambda
resource "aws_iam_role_policy" "step_function_policy" {
  name = "${var.lambda_name}-step-function-policy"
  role = aws_iam_role.step_function_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "lambda:InvokeFunction"
        ]
        Resource = aws_lambda_function.lambda.arn
      }
    ]
  })
}

# Step Function
resource "aws_sfn_state_machine" "state_machine" {
  name     = "${var.lambda_name}-state-machine"
  role_arn = aws_iam_role.step_function_role.arn

  definition = templatefile("${path.module}/step_function.json", {
    lambda_arn = aws_lambda_function.lambda.arn
  })
}

# Allow S3 to invoke the bridge Lambda
resource "aws_lambda_permission" "s3_invoke" {
  statement_id  = "AllowS3Invoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.bridge_lambda.function_name
  principal     = "s3.amazonaws.com"
  source_arn    = var.s3_bucket_arn
}

# Configure S3 bucket notification to trigger bridge Lambda
resource "aws_s3_bucket_notification" "bucket_notification" {
  bucket = var.s3_bucket_name

  lambda_function {
    lambda_function_arn = aws_lambda_function.bridge_lambda.arn
    events             = ["s3:ObjectCreated:*"]
  }

  depends_on = [aws_lambda_permission.s3_invoke]
} 