import { ChatHistory } from "./Chat";
import { Box, Typography, useTheme } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import ChatIcon from "@mui/icons-material/Chat";

interface ChatHistoryComponentProps {
  chatHistory: ChatHistory;
  isWaitingForResponse?: boolean;
}

export const ChatHistoryComponent = ({
  chatHistory,
  isWaitingForResponse = false,
}: ChatHistoryComponentProps) => {
  const theme = useTheme();

  if (!chatHistory.messages || chatHistory.messages.length === 0) {
    return (
      <Box
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
          color: "text.secondary",
          textAlign: "center",
          p: 4,
        }}
      >
        <ChatIcon
          sx={{
            fontSize: 64,
            color: theme.palette.primary.main,
            opacity: 0.5,
          }}
        />
        <Typography variant="h6" color="text.secondary">
          No messages yet
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ maxWidth: 400 }}
        >
          Start the conversation by sending a message below. I'm here to help
          you explore your knowledge base!
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {chatHistory.messages.map((message) => (
        <Box
          key={message.id}
          sx={{
            display: "flex",
            justifyContent: message.role === "user" ? "flex-end" : "flex-start",
            gap: 1,
            alignItems: "flex-start",
          }}
        >
          {message.role === "assistant" && (
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                flexShrink: 0,
                mt: 1,
              }}
            >
              <SmartToyIcon fontSize="small" />
            </Box>
          )}

          <Box
            sx={{
              maxWidth: "70%",
              p: 2,
              borderRadius: 2,
              background:
                message.role === "user"
                  ? theme.palette.primary.main
                  : "rgba(255, 255, 255, 0.05)",
              color:
                message.role === "user"
                  ? theme.palette.primary.contrastText
                  : theme.palette.text.primary,
            }}
          >
            <Typography variant="body1">{message.content}</Typography>
          </Box>

          {message.role === "user" && (
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: theme.palette.secondary.main,
                color: theme.palette.secondary.contrastText,
                flexShrink: 0,
                mt: 1,
              }}
            >
              <PersonIcon fontSize="small" />
            </Box>
          )}
        </Box>
      ))}

      {isWaitingForResponse && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-start",
            gap: 1,
            alignItems: "flex-start",
          }}
        >
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              flexShrink: 0,
              mt: 1,
            }}
          >
            <SmartToyIcon fontSize="small" />
          </Box>

          <Box
            sx={{
              maxWidth: "70%",
              p: 2,
              borderRadius: 2,
              background: "rgba(255, 255, 255, 0.05)",
              color: theme.palette.text.primary,
              display: "flex",
              gap: 0.5,
            }}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: theme.palette.primary.main,
                animation: "bounce 1.4s infinite ease-in-out",
                animationDelay: "0s",
              }}
            />
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: theme.palette.primary.main,
                animation: "bounce 1.4s infinite ease-in-out",
                animationDelay: "0.2s",
              }}
            />
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: theme.palette.primary.main,
                animation: "bounce 1.4s infinite ease-in-out",
                animationDelay: "0.4s",
              }}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
};
