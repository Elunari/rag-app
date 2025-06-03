import { fetchAuthSession } from "@aws-amplify/auth";

const API_URL = process.env.REACT_APP_BACKEND_URL;

export interface Chat {
  chatId: string;
  title: string;
  created_at: number;
  updated_at: string;
  userId: string;
  messageCount: number;
}

export interface Message {
  message: string;
  author: "user" | "assistant";
  timestamp: number;
}

export const getAuthHeaders = async () => {
  try {
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();

    if (!token) {
      throw new Error("No authentication token available");
    }

    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  } catch (error) {
    console.error("Error getting auth headers:", error);
    throw error;
  }
};

export const api = {
  async get(endpoint: string) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API error response:", errorText);
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    return data;
  },

  async post(endpoint: string, data: any) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API error response:", errorText);
      throw new Error("Network response was not ok");
    }

    const responseData = await response.json();
    return responseData;
  },
};

export async function createChat(title: string): Promise<Chat> {
  const response = await api.post(`/chats/${title}`, {});
  return response;
}

export async function getChats(): Promise<Chat[]> {
  const response = await api.get("/chats");
  return response;
}

export async function getChat(chatId: string): Promise<Chat> {
  const response = await api.get(`/chats/${chatId}`);
  return response;
}

export async function getMessages(chatId: string): Promise<Message[]> {
  const response = await api.get(`/chats/${chatId}/messages`);
  return response;
}

export async function sendMessage(
  chatId: string,
  content: string
): Promise<Message> {
  const response = await api.post(`/chats/${chatId}/messages`, { content });
  return response;
}

export async function uploadKnowledge(file: File): Promise<void> {
  try {
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();

    if (!token) {
      throw new Error("No authentication token available");
    }

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_URL}/add_to_knowledge_base`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: "Failed to upload file" }));
      throw new Error(error.message || "Failed to upload file");
    }
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
}
