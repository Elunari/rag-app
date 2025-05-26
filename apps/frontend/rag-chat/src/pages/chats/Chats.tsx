import { useState } from "react";
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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

export const Chats = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [chats, setChats] = useState<ChatHistory[]>([
    {
      id: "1",
      name: "Chat 1",
      createdAt: "2021-01-01",
    },
    {
      id: "2",
      name: "Chat 2",
      createdAt: "2021-01-02",
    },
  ]);

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
              key={chat.id}
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
                to={`/chat/${chat.id}`}
                sx={{
                  py: 1.5,
                  "&:hover": {
                    background: "rgba(255, 255, 255, 0.05)",
                  },
                }}
              >
                <ListItemText primary={chat.name} />
                <Chip
                  label={new Date(chat.createdAt).toLocaleDateString()}
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
    </Container>
  );
};
