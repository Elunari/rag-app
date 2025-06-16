# Knowledge Base RAG Application

A Retrieval-Augmented Generation (RAG) application that uses AWS services to provide intelligent document search and chat capabilities.

## Infrastructure Overview

### AWS Services Used

- **API Gateway**: HTTP API for frontend communication
- **Lambda**: Serverless functions for API and processing
- **Cognito**: User authentication and authorization
- **DynamoDB**: Chat and message storage
- **S3**: Document storage
- **Kendra**: Semantic database for knowledge queries
- **SQS**: Message queue for document processing
- **SNS**: Notifications for processing status
- **Amplify**: Frontend hosting and CI/CD

### Infrastructure Structure (`/infra`)

#### Modules (`/infra/modules`)

- **api**: API Gateway and Lambda function for the main API
- **cognito**: User authentication and authorization
- **dynamodb**: Chat and message storage tables
- **s3**: Document storage bucket
- **kendra**: Vector search domain
- **sqs**: Message queue for processing
- **sns**: Notification topics
- **amplify**: Frontend hosting
- **embeddings_processor**: Document processing Lambda
- **s3_trigger_lambda**: S3 event processing
- **notification_handler**: Processing status notifications

#### Environments (`/infra/environments`)

- **dev**: Development environment configuration
- **prod**: Production environment configuration (when added)

### Application Structure (`/apps`)

#### API (`/apps/api`)

- FastAPI-based Lambda function
- Handles chat and document management
- Integrates with Kendra for retrieval
- Uses Cognito for authentication

#### Frontend (`/apps/frontend`)

- React-based web application
- Amplify-hosted
- Cognito authentication
- Real-time chat interface

#### Processing (`/apps/embeddings_processor`)

- Document processing Lambda
- Generates embeddings
- Updates Kendra index

#### S3 Trigger (`/apps/s3-trigger-lambda`)

- Handles S3 upload events
- Initiates document processing
- Manages processing queue

## Authentication Flow

1. Users authenticate through Cognito User Pool
2. JWT tokens are used for API access
3. API Gateway validates tokens
4. Lambda functions process authenticated requests

## Document Processing Flow

1. User uploads document to S3
2. S3 trigger Lambda initiates processing
3. Embeddings processor updated Kendra indices
4. User is notified of completion

## Chat Flow

1. User creates chat session
2. Messages are stored in DynamoDB
3. Kendra retrieves relevant documents
4. LLM generates responses
5. Real-time updates via API

## Development

### Prerequisites

- AWS CLI configured
- Terraform installed
- Python 3.9+
- Node.js 16+

### Setup

1. Clone the repository
2. Configure AWS credentials
3. Initialize Terraform:
   ```bash
   cd infra/environments/dev
   terraform init
   ```
4. Apply infrastructure:
   ```bash
   terraform apply
   ```

### Environment Variables

Required environment variables for terraform:

- `AWS_REGION`
- `SES_SENDER_EMAIL`
- `GITHUB_TOKEN`
- `REPOSITORY_URL`

The variables example is stored in `terraform.tfvars.example`. It needs to be filled with real data, in file called `terraform.tfvars` in same directory.

Required environment variables for frontend:

- `REACT_APP_BACKEND_URL`
- `REACT_APP_REGION`
- `REACT_APP_USER_POOL_ID`
- `REACT_APP_USER_POOL_CLIENT_ID`
- `REACT_APP_COGNITO_DOMAIN`

Frontend variables are autoamatically filled by terraform during deployment. For local development they need to be filled manually and placed in `.env` file in frontend root dir.

## Deployment

1. Frontend: Automatic deployment via Amplify
2. Backend: Manual deployment via Terraform
3. Processing: Automatic deployment via Terraform

## Monitoring

- X-Ray for distributed tracing
- CloudWatch for logs
- SNS for processing notifications

## Security

- Cognito for authentication
- IAM roles for service access
- API Gateway authorization
- Encrypted data at rest
