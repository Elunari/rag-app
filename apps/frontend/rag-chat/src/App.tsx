import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Home } from "./pages/home/Home";
import { Chats } from "./pages/chats/Chats";
import { Chat } from "./pages/chat/Chat";
import { NewChat } from "./pages/new-chat/NewChat";
import { AddKnowledge } from "./pages/add-knowledge/AddKnowledge";
import { Navbar } from "./Navbar";

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
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chats" element={<Chats />} />
          <Route path="/chat/new" element={<NewChat />} />
          <Route path="/chat/:id" element={<Chat />} />
          <Route path="/add-knowledge" element={<AddKnowledge />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
