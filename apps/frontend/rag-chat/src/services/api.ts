import { fetchAuthSession } from "@aws-amplify/auth";

const API_URL = process.env.REACT_APP_BACKEND_URL;

export interface Chat {
  userId: string;
  chatId: string;
  chatName: string;
  createdAt: number;
  lastMessageAt: number;
  messageCount: number;
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

export const uploadKnowledge = async (file: File): Promise<void> => {
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
};

export const api = {
  async get(endpoint: string) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "GET",
      headers,
      credentials: "include",
    });
    if (!response.ok) throw new Error("Network response was not ok");
    return response.json();
  },

  async post(endpoint: string, data: any) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
      credentials: "include",
    });
    if (!response.ok) throw new Error("Network response was not ok");
    return response.json();
  },

  async put(endpoint: string, data: any) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(data),
      credentials: "include",
    });
    if (!response.ok) throw new Error("Network response was not ok");
    return response.json();
  },

  async delete(endpoint: string) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "DELETE",
      headers,
      credentials: "include",
    });
    if (!response.ok) throw new Error("Network response was not ok");
    return response.json();
  },
};

export async function createChat(chatName: string): Promise<Chat> {
  const response = await api.post("/chats", { chatName });
  return response.chat;
}

export async function getChats(): Promise<Chat[]> {
  const response = await api.get("/chats");
  return response.chats;
}

export async function getChat(chatId: string): Promise<Chat> {
  const response = await api.get(`/chats/${chatId}`);
  return response.chat;
}
