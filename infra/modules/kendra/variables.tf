variable "index_name" {
  description = "Name of the Kendra index"
  type        = string
}

variable "index_description" {
  description = "Description of the Kendra index"
  type        = string
}

variable "edition" {
  description = "Edition of the Kendra index (DEVELOPER_EDITION or ENTERPRISE_EDITION)"
  type        = string
  default     = "DEVELOPER_EDITION"
}

variable "kms_key_id" {
  description = "KMS key ID for encryption"
  type        = string
  default     = null
}

variable "role_arn" {
  description = "ARN of the IAM role for Kendra"
  type        = string
} 