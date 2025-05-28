resource "aws_amplify_app" "frontend" {
  name = var.app_name
  repository = var.repository_url
  access_token = var.github_token
  platform = "WEB"

  build_spec = <<-EOT
    version: 1
    frontend:
      phases:
        preBuild:
          commands:
            - cd apps/frontend/rag-chat
            - npm cache clean --force
            - rm -rf node_modules
            - npm ci
        build:
          commands:
            - npm run build
      artifacts:
        baseDirectory: apps/frontend/rag-chat/build
        files:
          - '**/*'
          - 'index.html'
      cache:
        paths:
          - node_modules/**/*
  EOT

  environment_variables = {
    REACT_APP_BACKEND_URL = var.backend_url
    REACT_APP_ENV         = "development"
    REACT_APP_REGION      = var.aws_region
  }

  enable_branch_auto_build = true
  enable_branch_auto_deletion = true

  custom_rule {
    source = "</^[^.]+$|\\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json)$)([^.]+$)/>"
    target = "/index.html"
    status = "200"
  }
}

resource "aws_amplify_branch" "master" {
  app_id      = aws_amplify_app.frontend.id
  branch_name = "master"

  framework = "React"
  stage     = "DEVELOPMENT"

  enable_auto_build = true
  enable_pull_request_preview = true
  enable_basic_auth = false
  enable_notification = true
}

# Add webhook for GitHub
resource "aws_amplify_webhook" "master" {
  app_id      = aws_amplify_app.frontend.id
  branch_name = aws_amplify_branch.master.branch_name
  description = "Webhook for master branch"
}

resource "aws_amplify_domain_association" "main" {
  count = var.domain_name != null ? 1 : 0

  app_id      = aws_amplify_app.frontend.id
  domain_name = var.domain_name

  sub_domain {
    branch_name = aws_amplify_branch.master.branch_name
    prefix      = "dev"
  }
}
