import { useState } from "react";
import { ChatHistoryComponent } from "./ChatHistoryComponent";
import { ChatInput } from "./ChatInput";

export type ChatMessage = {
  id: string;
  content: string;
  role: "user" | "assistant";
};

export type ChatHistory = {
  id: string;
  name: string;
  createdAt: string;
  messages?: ChatMessage[];
};

export const Chat = () => {
  const [chatHistory, setChatHistory] = useState<ChatHistory>({
    id: "1",
    name: "Chat 1",
    createdAt: "2021-01-01",
    messages: [
      {
        id: "1",
        content: "Hello, how are you?",
        role: "user",
      },
      {
        id: "2",
        content: "I'm fine, thank you!",
        role: "assistant",
      },
      {
        id: "3",
        content: "What is the capital of France?",
        role: "user",
      },
      {
        id: "4",
        content: "The capital of France is Paris.",
        role: "assistant",
      },
    ],
  });

  return (
    <div>
      <h1>{chatHistory.name}</h1>
      <ChatHistoryComponent chatHistory={chatHistory} />
      <ChatInput />
    </div>
  );
};
