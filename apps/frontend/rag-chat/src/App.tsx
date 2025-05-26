import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { Chat } from "./pages/chat/Chat";
import { Home } from "./pages/home/Home";
import { Chats } from "./pages/chats/Chats";

function App() {
  return (
    <Router>
      <nav style={{ marginBottom: "1rem" }}>
        <Link to="/">Home</Link> | <Link to="/chats">Chats</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chats" element={<Chats />} />
        <Route path="/chats/:id" element={<Chat />} />
      </Routes>
    </Router>
  );
}

export default App;
