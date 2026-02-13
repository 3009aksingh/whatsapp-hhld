"use client";

import useSocket from "@/hooks/useSocket";
import { useState } from "react";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";

type Message = {
  from: string;
  text: string;
};

export default function ChatWindow() {
  const userId = "userA"; // change in second tab

  const [messages, setMessages] = useState<Message[]>([]);

  const socketRef = useSocket(userId, (msg) => {
    if (msg.type === "message") {
      setMessages((prev) => [
        ...prev,
        {
          from: msg.from,
          text: msg.text,
        },
      ]);
    }
  });

  const sendMessage = (text: string) => {
    if (!socketRef.current) return;

    const receiver = userId === "userA" ? "userB" : "userA";

    socketRef.current.send(
      JSON.stringify({
        type: "message",
        from: userId,
        to: receiver,
        text,
      })
    );

    setMessages((prev) => [
      ...prev,
      {
        from: userId,
        text,
      },
    ]);
  };

  return (
    <div
      style={{
        width: "75%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div style={{ padding: "1rem", overflowY: "auto", flex: 1 }}>
        {messages.map((msg, index) => (
          <MessageBubble
            key={index}
            text={msg.text}
            isOwn={msg.from === userId}
          />
        ))}
      </div>

      <MessageInput onSend={sendMessage} />
    </div>
  );
}
