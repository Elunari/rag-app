output "chats_table_name" {
  value = aws_dynamodb_table.chats.name
}

output "messages_table_name" {
  value = aws_dynamodb_table.messages.name
} 