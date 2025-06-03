resource "aws_iam_role" "lambda_role" {
  name = "lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

# IAM policy for Lambda to access S3
resource "aws_iam_role_policy" "lambda_s3_policy" {
  name = "lambda_s3_policy"
  role = aws_iam_role.lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:GetObject",
          "s3:DeleteObject"
        ]
        Resource = "${module.s3.bucket_arn}/*"
      }
    ]
  })
}

# IAM policy for Lambda to write logs
resource "aws_iam_role_policy_attachment" "lambda_logs" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# IAM policy for Lambda to receive S3 events
resource "aws_iam_role_policy" "lambda_s3_event_policy" {
  name = "lambda_s3_event_policy"
  role = aws_iam_role.lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:ListBucket"
        ]
        Resource = [
          "${module.s3.bucket_arn}",
          "${module.s3.bucket_arn}/*"
        ]
      }
    ]
  })
}

# IAM policy for Lambda to start Step Function executions
resource "aws_iam_role_policy" "lambda_step_functions_policy" {
  name = "lambda_step_functions_policy"
  role = aws_iam_role.lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "states:StartExecution"
        ]
        Resource = "*"  # We'll restrict this to specific state machines in production
      }
    ]
  })
}

resource "aws_lambda_permission" "api_gateway_invoke" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = module.api.lambda_name
  principal     = "apigateway.amazonaws.com"
}

# IAM policy for Lambda
resource "aws_iam_role_policy" "lambda_policy" {
  name = "lambda-policy"
  role = aws_iam_role.lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:ListBucket"
        ]
        Resource = [
          "arn:aws:s3:::${module.s3.bucket_name}",
          "arn:aws:s3:::${module.s3.bucket_name}/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:*"
      },
      {
        Effect = "Allow"
        Action = [
          "sqs:SendMessage",
          "sqs:ReceiveMessage",
          "sqs:DeleteMessage",
          "sqs:GetQueueAttributes"
        ]
        Resource = module.sqs.queue_arn
      },
      {
        Effect = "Allow"
        Action = [
          "dynamodb:PutItem",
          "dynamodb:GetItem",
          "dynamodb:Query",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Scan"
        ]
        Resource = [
          "arn:aws:dynamodb:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:table/${module.dynamodb.chats_table_name}",
          "arn:aws:dynamodb:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:table/${module.dynamodb.messages_table_name}",
          "arn:aws:dynamodb:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:table/${module.dynamodb.chats_table_name}/index/*",
          "arn:aws:dynamodb:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:table/${module.dynamodb.messages_table_name}/index/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "bedrock:InvokeModel"
        ]
        Resource = "arn:aws:bedrock:*::foundation-model/amazon.titan-text-lite-v1"
      }
    ]
  })
}

data "aws_region" "current" {}
data "aws_caller_identity" "current" {}