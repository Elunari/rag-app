import { useState } from "react";
import { Link } from "react-router-dom";
import { ChatHistory } from "../chat/Chat";

export const Chats = () => {
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

  const chatList = chats.map((chat) => (
    <div key={chat.id} style={{ width: "25%" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Link to={`/chats/${chat.id}`}>{chat.name}</Link>
        <span>{chat.createdAt}</span>
      </div>
    </div>
  ));

  return <>{chatList}</>;
};
