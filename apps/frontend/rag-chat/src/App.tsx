import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import auth from "./services/auth";
import { Login } from "./pages/login/Login";
import { Register } from "./pages/register/Register";
import { Chat } from "./pages/chat/Chat";
import { Chats } from "./pages/chats/Chats";
import { NewChat } from "./pages/new-chat/NewChat";
import { AddKnowledge } from "./pages/add-knowledge/AddKnowledge";
import { Home } from "./pages/home/Home";
import { PrivateRoute } from "./components/PrivateRoute";
import { Navbar } from "./components/Navbar";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#2196F3",
      light: "#64B5F6",
      dark: "#1976D2",
    },
    secondary: {
      main: "#424242",
      light: "#616161",
      dark: "#212121",
    },
    background: {
      default: "#121212",
      paper: "#1E1E1E",
    },
    text: {
      primary: "#FFFFFF",
      secondary: "rgba(255, 255, 255, 0.7)",
    },
  },
  typography: {
    fontFamily: [
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
    ].join(","),
    h2: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          textTransform: "none",
          fontWeight: 500,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        "@keyframes bounce": {
          "0%, 80%, 100%": {
            transform: "scale(0)",
            opacity: 0.3,
          },
          "40%": {
            transform: "scale(1)",
            opacity: 1,
          },
        },
      },
    },
  },
});

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    auth.configureAuth();
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const user = await auth.getCurrentUser();
      setIsAuthenticated(!!user);
    } catch (error) {
      setIsAuthenticated(false);
    }
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleSwitchToRegister = () => {
    setShowRegister(true);
  };

  const handleSwitchToLogin = () => {
    setShowRegister(false);
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route
            path="/login"
            element={
              !isAuthenticated ? (
                showRegister ? (
                  <Register onSwitchToLogin={handleSwitchToLogin} />
                ) : (
                  <Login
                    onLoginSuccess={handleLoginSuccess}
                    onSwitchToRegister={handleSwitchToRegister}
                  />
                )
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Navbar onLogout={handleLogout} />
                <Home />
              </PrivateRoute>
            }
          />
          <Route
            path="/chats"
            element={
              <PrivateRoute>
                <Navbar onLogout={handleLogout} />
                <Chats />
              </PrivateRoute>
            }
          />
          <Route
            path="/chat/new"
            element={
              <PrivateRoute>
                <Navbar onLogout={handleLogout} />
                <NewChat />
              </PrivateRoute>
            }
          />
          <Route
            path="/chat/:id"
            element={
              <PrivateRoute>
                <Navbar onLogout={handleLogout} />
                <Chat />
              </PrivateRoute>
            }
          />
          <Route
            path="/add-knowledge"
            element={
              <PrivateRoute>
                <Navbar onLogout={handleLogout} />
                <AddKnowledge />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;
