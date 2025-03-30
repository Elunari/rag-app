import { AWS_CONFIG } from './aws-config';

interface ChatResponse {
  message: string;
  timestamp: string;
}

export class ApiService {
  private static instance: ApiService;
  private baseUrl: string;

  private constructor() {
    this.baseUrl = AWS_CONFIG.apiEndpoint;
  }

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  async sendMessage(message: string): Promise<ChatResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/send_prompt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        message: data.message || "Message received by LocalStack API Gateway",
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }
} 