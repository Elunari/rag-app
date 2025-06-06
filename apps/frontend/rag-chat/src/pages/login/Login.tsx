import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress,
} from "@mui/material";
import auth from "../../services/auth";

interface LoginProps {
  onLoginSuccess: () => void;
  onSwitchToRegister: () => void;
}

export const Login: React.FC<LoginProps> = ({
  onLoginSuccess,
  onSwitchToRegister,
}) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmationCode, setConfirmationCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (needsConfirmation) {
        await auth.confirmSignup(username, confirmationCode);
        setNeedsConfirmation(false);
        setConfirmationCode("");
        // Try to login after confirmation
        await handleLogin();
      } else {
        await handleLogin();
      }
    } catch (error: any) {
      console.error("Login error:", error);
      if (error.message?.includes("confirm your email")) {
        setNeedsConfirmation(true);
      }
      setError(
        error.message || "Failed to login. Please check your credentials."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    const result = await auth.signIn(username, password);
    onLoginSuccess();
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        bgcolor: "background.default",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          width: "100%",
          maxWidth: 400,
          bgcolor: "background.paper",
        }}
      >
        <Typography variant="h5" component="h1" gutterBottom align="center">
          {needsConfirmation ? "Confirm Your Email" : "Login"}
        </Typography>

        <form onSubmit={handleSubmit}>
          {!needsConfirmation && (
            <>
              <TextField
                fullWidth
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                margin="normal"
                required
                autoFocus
              />

              <TextField
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                margin="normal"
                required
              />
            </>
          )}

          {needsConfirmation && (
            <TextField
              fullWidth
              label="Confirmation Code"
              value={confirmationCode}
              onChange={(e) => setConfirmationCode(e.target.value)}
              margin="normal"
              required
              helperText="Please enter the confirmation code sent to your email"
            />
          )}

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={
              isLoading ||
              !username ||
              (!needsConfirmation && !password) ||
              (needsConfirmation && !confirmationCode)
            }
          >
            {isLoading ? (
              <CircularProgress size={24} />
            ) : needsConfirmation ? (
              "Confirm"
            ) : (
              "Login"
            )}
          </Button>

          <Button
            fullWidth
            variant="text"
            onClick={onSwitchToRegister}
            sx={{ mt: 1 }}
          >
            Don't have an account? Register
          </Button>
        </form>
      </Paper>
    </Box>
  );
};
