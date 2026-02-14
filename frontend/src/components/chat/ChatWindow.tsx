"use client";

import { useChat } from "@/context/ChatContext";
import { jwtDecode } from "jwt-decode";
import { useEffect, useMemo } from "react";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";

type DecodedToken = {
  username: string;
};

export default function ChatWindow() {
  const { selectedUser, messages, setMessages, sendMessage } = useChat();

  const userId = useMemo(() => {
    if (typeof window === "undefined") return "";

    const token = localStorage.getItem("token");
    if (!token) return "";

    try {
      const decoded = jwtDecode<DecodedToken>(token);
      return decoded.username;
    } catch {
      return "";
    }
  }, []);

  const receiver = selectedUser;

  useEffect(() => {
    if (!userId || !receiver) return;

    const fetchMessages = async () => {
      const res = await fetch(
        `http://localhost:5000/messages?user1=${userId}&user2=${receiver}`
      );
      const data = await res.json();
      setMessages(data);
    };

    fetchMessages();
  }, [userId, receiver]);

  if (!receiver) {
    return (
      <div
        style={{
          width: "70%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#111",
          color: "#666",
        }}
      >
        Select a user to start chatting
      </div>
    );
  }

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
            key={index}
            text={msg.text}
            isOwn={msg.from === userId}
          />
        ))}
      </div>

      <MessageInput
        onSend={(text) => {
          if (!receiver) return;
          sendMessage(receiver, text);
        }}
      />
    </div>
  );
}
