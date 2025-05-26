import { FC } from "react";
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  useTheme,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import ChatIcon from "@mui/icons-material/Chat";

export const Home: FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: theme.palette.background.default,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Container maxWidth="md">
        <Paper
          elevation={0}
          sx={{
            p: 6,
            textAlign: "center",
            background: theme.palette.background.paper,
            borderRadius: 2,
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <ChatIcon
            sx={{
              fontSize: 64,
              color: theme.palette.primary.main,
              mb: 3,
            }}
          />
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            color="primary"
            sx={{ mb: 2 }}
          >
            RAG Chat
          </Typography>
          <Typography
            variant="h5"
            color="text.secondary"
            paragraph
            sx={{ mb: 2 }}
          >
            Intelligent Document Processing
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 6, maxWidth: "600px", mx: "auto" }}
          >
            Transform your documents into interactive conversations with our
            advanced AI-powered chat system.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate("/chat/new")}
            sx={{
              px: 6,
              py: 2,
              fontSize: "1.1rem",
              background: theme.palette.primary.main,
              "&:hover": {
                background: theme.palette.primary.dark,
                transform: "translateY(-1px)",
              },
              transition: "all 0.2s ease-in-out",
            }}
          >
            Start New Chat
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};
