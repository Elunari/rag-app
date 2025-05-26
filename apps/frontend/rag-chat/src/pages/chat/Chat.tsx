import { useState } from "react";
import { ChatHistoryComponent } from "./ChatHistoryComponent";
import { ChatInput } from "./ChatInput";
import { Box, Container, Paper, Typography, useTheme } from "@mui/material";

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
          <ChatHistoryComponent chatHistory={chatHistory} />
        </Box>

        <Box
          sx={{
            p: 2,
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <ChatInput />
        </Box>
      </Paper>
    </Container>
  );
};
