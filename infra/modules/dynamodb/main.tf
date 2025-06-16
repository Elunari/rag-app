# DynamoDB table for storing chat metadata
resource "aws_dynamodb_table" "chats" {
  name           = "${var.project_name}-chats"
  billing_mode   = "PAY_PER_REQUEST"  # On-demand capacity mode
  hash_key       = "userId"           # Partition key
  range_key      = "chatId"           # Sort key

  # Attribute definitions
  attribute {
    name = "userId"  # User ID from Cognito
    type = "S"       # String type
  }

  attribute {
    name = "chatId"  # Unique chat identifier
    type = "S"       # String type
  }

  attribute {
    name = "lastMessageAt"  # Timestamp of last message
    type = "N"             # Number type (Unix timestamp)
  }

  # Global Secondary Index for querying chats by last message time
  global_secondary_index {
    name            = "LastMessageIndex"
    hash_key        = "userId"        # Partition key
    range_key       = "lastMessageAt" # Sort key
    projection_type = "ALL"           # Project all attributes
  }

  # Resource tags
  tags = {
    Name        = "${var.project_name}-chats"
    Environment = var.environment
  }
}

# DynamoDB table for storing chat messages
resource "aws_dynamodb_table" "messages" {
  name           = "${var.project_name}-messages"
  billing_mode   = "PAY_PER_REQUEST"  # On-demand capacity mode
  hash_key       = "chatId"           # Partition key
  range_key      = "messageId"        # Sort key

  # Attribute definitions
  attribute {
    name = "chatId"    # Chat ID (foreign key to chats table)
    type = "S"         # String type
  }

  attribute {
    name = "messageId" # Unique message identifier
    type = "S"         # String type
  }

  # Resource tags
  tags = {
    Name        = "${var.project_name}-messages"
    Environment = var.environment
  }
} 