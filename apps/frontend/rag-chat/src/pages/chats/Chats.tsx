import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChatHistory } from "../chat/Chat";
import {
  Box,
  Container,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Chip,
  Button,
  useTheme,
  CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { getChats, Chat } from "../../services/api";

export const Chats = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadChats = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const userChats = await getChats();
        setChats(userChats);
      } catch (err) {
        console.error("Failed to load chats:", err);
        setError("Failed to load chats. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    loadChats();
  }, []);

  if (isLoading) {
    return (
      <Container
        maxWidth="md"
        sx={{
          height: "calc(100vh - 64px)", // Subtract navbar height
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
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography color="error" align="center">
          {error}
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h4" component="h1">
          Your Chats
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/chat/new")}
          sx={{
            background: theme.palette.primary.main,
            "&:hover": {
              background: theme.palette.primary.dark,
            },
            transition: "all 0.2s ease-in-out",
          }}
        >
          New Chat
        </Button>
      </Box>

      {chats.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 4,
            textAlign: "center",
            background: theme.palette.background.paper,
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No chats yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Start a new chat to begin exploring your knowledge base
          </Typography>
        </Paper>
      ) : (
        <Paper
          elevation={0}
          sx={{
            background: theme.palette.background.paper,
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <List sx={{ py: 0 }}>
            {chats.map((chat) => (
              <ListItem
                key={chat.chatId}
                divider
                disablePadding
                sx={{
                  "&:last-child": {
                    borderBottom: "none",
                  },
                }}
              >
                <ListItemButton
                  component={Link}
                  to={`/chat/${chat.chatId}`}
                  sx={{
                    py: 1.5,
                    "&:hover": {
                      background: "rgba(255, 255, 255, 0.05)",
                    },
                  }}
                >
                  <ListItemText
                    primary={decodeURIComponent(chat.title)}
                    secondary={`${chat.messageCount} messages`}
                  />
                  <Chip
                    label={new Date(chat.updated_at).toLocaleDateString()}
                    size="small"
                    sx={{
                      background: "rgba(255, 255, 255, 0.1)",
                      color: "text.secondary",
                      height: 20,
                      "& .MuiChip-label": {
                        px: 1,
                        fontSize: "0.75rem",
                      },
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Container>
  );
};
