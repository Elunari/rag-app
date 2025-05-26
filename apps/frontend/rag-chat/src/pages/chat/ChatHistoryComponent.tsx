import { ChatHistory } from "./Chat";
import { Box, Typography, useTheme } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import SmartToyIcon from "@mui/icons-material/SmartToy";

export const ChatHistoryComponent = ({
  chatHistory,
}: {
  chatHistory: ChatHistory;
}) => {
  const theme = useTheme();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {chatHistory.messages?.map((message) => (
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
    </Box>
  );
};
