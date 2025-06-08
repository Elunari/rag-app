output "domain_endpoint" {
  description = "OpenSearch domain endpoint"
  value       = aws_opensearch_domain.knowledge_base.endpoint
}

output "domain_arn" {
  description = "OpenSearch domain ARN"
  value       = aws_opensearch_domain.knowledge_base.arn
}

output "domain_name" {
  description = "OpenSearch domain name"
  value       = aws_opensearch_domain.knowledge_base.domain_name
}

output "index_name" {
  description = "OpenSearch index name"
  value       = aws_opensearch_domain.knowledge_base.domain_name
} 