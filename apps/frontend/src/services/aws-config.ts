export const AWS_CONFIG = {
  region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
  apiEndpoint: import.meta.env.VITE_API_GATEWAY_ENDPOINT || 'http://localhost:4510',
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID || 'test',
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY || 'test',
  }
}; 