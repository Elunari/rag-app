import { ChatHistory } from "./Chat";

export const ChatHistoryComponent = ({
  chatHistory,
}: {
  chatHistory: ChatHistory;
}) => {
  return (
    <div>
      {chatHistory.messages?.map((message) => (
        <div
          key={message.id}
          style={{
            display: "flex",
            justifyContent: message.role === "user" ? "flex-end" : "flex-start",
            width: "50%",
            backgroundColor: "grey",
          }}
        >
          <ChatMessage
            message={message.content}
            color={message.role === "user" ? "blue" : "green"}
          />
        </div>
      ))}
    </div>
  );
};

const ChatMessage = ({
  message,
  color,
}: {
  message: string;
  color: string;
}) => {
  return (
    <div
      style={{ backgroundColor: color, width: "fit-content", padding: "10px" }}
    >
      {message}
    </div>
  );
};
