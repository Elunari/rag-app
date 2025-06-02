resource "aws_dynamodb_table" "chats" {
  name           = "${var.project_name}-chats"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "userId"
  range_key      = "chatId"

  attribute {
    name = "userId"
    type = "S"
  }

  attribute {
    name = "chatId"
    type = "S"
  }

  attribute {
    name = "lastMessageAt"
    type = "N"
  }

  global_secondary_index {
    name            = "LastMessageIndex"
    hash_key        = "userId"
    range_key       = "lastMessageAt"
    projection_type = "ALL"
  }

  tags = {
    Name        = "${var.project_name}-chats"
    Environment = var.environment
  }
}

resource "aws_dynamodb_table" "messages" {
  name           = "${var.project_name}-messages"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "chatId"
  range_key      = "messageId"

  attribute {
    name = "chatId"
    type = "S"
  }

  attribute {
    name = "messageId"
    type = "S"
  }

  tags = {
    Name        = "${var.project_name}-messages"
    Environment = var.environment
  }
} 