# Cognito User Pool for user authentication and management
resource "aws_cognito_user_pool" "main" {
  name = var.user_pool_name

  # Password policy requirements
  password_policy {
    minimum_length    = 8
    require_lowercase = true
    require_numbers   = true
    require_symbols   = true
    require_uppercase = true
  }

  # Automatically verify email addresses
  auto_verified_attributes = ["email"]
  verification_message_template {
    default_email_option = "CONFIRM_WITH_CODE"  # Send verification code via email
  }

  # Use Cognito's default email service
  email_configuration {
    email_sending_account = "COGNITO_DEFAULT"
  }

  # User attributes schema
  schema {
    name                = "email"
    attribute_data_type = "String"
    mutable            = true
    required           = true

    string_attribute_constraints {
      min_length = 1
      max_length = 256
    }
  }
}

# Cognito User Pool Client for frontend application
resource "aws_cognito_user_pool_client" "client" {
  name = "rag-chat-client"

  user_pool_id = aws_cognito_user_pool.main.id
  generate_secret = false  # Public client (no client secret)

  # Authentication flows supported by the client
  explicit_auth_flows = [
    "ALLOW_USER_SRP_AUTH",        # Secure Remote Password protocol
    "ALLOW_REFRESH_TOKEN_AUTH",   # Refresh token flow
    "ALLOW_USER_PASSWORD_AUTH"    # Username/password flow
  ]

  # OAuth 2.0 configuration
  callback_urls = ["https://${var.app_domain}"]  # Redirect after authentication
  logout_urls   = ["https://${var.app_domain}"]  # Redirect after logout
  default_redirect_uri = "https://${var.app_domain}"

  # OAuth 2.0 flows and scopes
  allowed_oauth_flows = ["code"]  # Authorization code flow
  allowed_oauth_flows_user_pool_client = true
  allowed_oauth_scopes = ["email", "openid", "profile"]  # Standard OAuth scopes

  # Identity providers
  supported_identity_providers = ["COGNITO"]  # Only Cognito user pool
} 