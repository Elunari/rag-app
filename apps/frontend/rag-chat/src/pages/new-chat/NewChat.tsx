import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  useTheme,
  CircularProgress,
  Alert,
} from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import { createChat } from "../../services/api";

export const NewChat = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [chatName, setChatName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatName.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const chat = await createChat(chatName.trim());
      navigate(`/chat/${chat.chatId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create chat");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ height: "calc(100vh - 64px)", py: 4 }}>
      <Paper
        elevation={0}
        sx={{
          p: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          background: theme.palette.background.paper,
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: 2,
        }}
      >
        <ChatIcon
          sx={{
            fontSize: 48,
            color: theme.palette.primary.main,
            mb: 3,
          }}
        />

        <Typography variant="h5" component="h1" gutterBottom>
          Create New Chat
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mb: 4, textAlign: "center" }}
        >
          Give your chat a name to get started
        </Typography>

        {error && (
          <Alert severity="error" sx={{ width: "100%", mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <TextField
            fullWidth
            label="Chat Name"
            value={chatName}
            onChange={(e) => setChatName(e.target.value)}
            variant="outlined"
            required
            disabled={isLoading}
            error={!!error}
            sx={{
              "& .MuiOutlinedInput-root": {
                background: "rgba(255, 255, 255, 0.05)",
                "&:hover": {
                  background: "rgba(255, 255, 255, 0.08)",
                },
                "&.Mui-focused": {
                  background: "rgba(255, 255, 255, 0.1)",
                },
              },
            }}
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={!chatName.trim() || isLoading}
            sx={{
              mt: 2,
              py: 1.5,
              background: theme.palette.primary.main,
              "&:hover": {
                background: theme.palette.primary.dark,
                transform: "translateY(-1px)",
              },
              transition: "all 0.2s ease-in-out",
            }}
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Start Chatting"
            )}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};
