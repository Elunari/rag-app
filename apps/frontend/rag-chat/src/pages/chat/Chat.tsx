import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { ChatHistoryComponent } from "./ChatHistoryComponent";
import { ChatInput } from "./ChatInput";
import {
  Box,
  Container,
  Paper,
  Typography,
  useTheme,
  CircularProgress,
} from "@mui/material";
import { getChat, getMessages, sendMessage, Message } from "../../services/api";

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
  const theme = useTheme();
  const { id } = useParams<{ id: string }>();
  const [chatHistory, setChatHistory] = useState<ChatHistory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const loadChat = useCallback(async () => {
    if (!id) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const chat = await getChat(id);

      const messages = await getMessages(id);

      const transformedMessages = messages.map((msg: Message) => ({
        id: String(msg.timestamp),
        content: msg.message,
        role: msg.author as "user" | "assistant",
      }));

      setChatHistory({
        id: chat.chatId,
        name: decodeURIComponent(chat.title),
        createdAt: String(chat.created_at),
        messages: transformedMessages,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load chat");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadChat();
  }, [loadChat]);

  const handleSendMessage = async (content: string) => {
    if (!id || !chatHistory) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      role: "user",
    };

    setChatHistory((prev) => ({
      ...prev!,
      messages: [...(prev?.messages || []), userMessage],
    }));

    setIsSending(true);
    try {
      const response = await sendMessage(id, content);

      const assistantMessage: ChatMessage = {
        id: String(response.timestamp),
        content: response.message,
        role: "assistant",
      };

      setChatHistory((prev) => ({
        ...prev!,
        messages: [...(prev?.messages || []), assistantMessage],
      }));
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <Container
        maxWidth="lg"
        sx={{
          height: "calc(100vh - 64px)",
          py: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container
        maxWidth="lg"
        sx={{
          height: "calc(100vh - 64px)",
          py: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  if (!chatHistory) {
    return (
      <Container
        maxWidth="lg"
        sx={{
          height: "calc(100vh - 64px)",
          py: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography>Chat not found</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ height: "calc(100vh - 64px)", py: 2 }}>
      <Paper
        elevation={0}
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: theme.palette.background.paper,
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: 2,
        }}
      >
        <Box
          sx={{
            p: 2,
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <Typography variant="h6" component="h1">
            {chatHistory.name}
          </Typography>
        </Box>

        <Box
          sx={{
            flex: 1,
            overflow: "auto",
            p: 2,
          }}
        >
          <ChatHistoryComponent
            chatHistory={chatHistory}
            isWaitingForResponse={isSending}
          />
        </Box>

        <Box
          sx={{
            p: 2,
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <ChatInput
            chatId={id!}
            onSendMessage={handleSendMessage}
            isSending={isSending}
          />
        </Box>
      </Paper>
    </Container>
  );
};
