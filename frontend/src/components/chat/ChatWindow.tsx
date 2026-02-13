"use client";

import useSocket from "@/hooks/useSocket";
import { useEffect, useState } from "react";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";

type Message = {
  _id?: string;
  from: string;
  to?: string;
  text: string;
};

export default function ChatWindow() {
  const userId = "userA"; // temporary until login page built
  const receiver = userId === "userA" ? "userB" : "userA";

  const [messages, setMessages] = useState<Message[]>([]);

  // 🔹 Fetch old messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/messages?user1=${userId}&user2=${receiver}`
        );
        const data = await res.json();
        setMessages(data);
      } catch (err) {
        console.error("Failed to load messages", err);
      }
    };

    fetchMessages();
  }, [userId]);

  // 🔹 Real-time socket (NO userId passed now)
  const socketRef = useSocket((msg) => {
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

    socketRef.current.send(
      JSON.stringify({
        type: "message",
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
        width: "70%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: "#111",
      }}
    >
      <div style={{ padding: "1rem", overflowY: "auto", flex: 1 }}>
        {messages.map((msg, index) => (
          <MessageBubble
            key={msg._id || index}
            text={msg.text}
            isOwn={msg.from === userId}
          />
        ))}
      </div>

      <MessageInput onSend={sendMessage} />
    </div>
  );
}
