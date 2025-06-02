import boto3
import os
from typing import Dict, Any

class KnowledgeBaseService:
    def __init__(self):
        self.s3 = boto3.client('s3')
        self.bucket_name = os.environ['S3_BUCKET_NAME']
        self.project_name = os.environ['PROJECT_NAME']

    def add_file(self, file_content: str, file_name: str) -> Dict[str, Any]:
        """Add a file to the knowledge base"""
        if not file_content or not file_name:
            raise ValueError('Missing required fields')

        # Upload to S3
        key = f"{self.project_name}/documents/{file_name}"
        self.s3.put_object(
            Bucket=self.bucket_name,
            Key=key,
            Body=file_content
        )

        return {
            'message': 'Document added successfully',
            'key': key
        } 