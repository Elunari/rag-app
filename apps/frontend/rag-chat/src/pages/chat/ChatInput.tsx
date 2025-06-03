import { useState } from "react";
import { Box, TextField, IconButton, useTheme } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

interface ChatInputProps {
  chatId: string;
  onSendMessage: (content: string) => Promise<void>;
  isSending: boolean;
}

export const ChatInput = ({
  chatId,
  onSendMessage,
  isSending,
}: ChatInputProps) => {
  const theme = useTheme();
  const [message, setMessage] = useState("");

  const handleSend = async () => {
    if (!message.trim() || isSending) return;

    const content = message.trim();
    setMessage(""); // Clear input immediately
    await onSendMessage(content);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        gap: 1,
        alignItems: "flex-end",
      }}
    >
      <TextField
        fullWidth
        multiline
        maxRows={4}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Type your message..."
        variant="outlined"
        size="small"
        disabled={isSending}
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
      <IconButton
        onClick={handleSend}
        disabled={!message.trim() || isSending}
        sx={{
          background: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          "&:hover": {
            background: theme.palette.primary.dark,
          },
          "&.Mui-disabled": {
            background: "rgba(255, 255, 255, 0.1)",
            color: "rgba(255, 255, 255, 0.3)",
          },
        }}
      >
        <SendIcon />
      </IconButton>
    </Box>
  );
};
