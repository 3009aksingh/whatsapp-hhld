"use client";

import { useChat } from "@/context/ChatContext";
import { useEffect } from "react";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";

export default function ChatWindow() {
  const {
    currentUser,
    selectedUser,
    messages,
    setMessages,
    sendMessage,
  } = useChat();

  const receiver = selectedUser;

  useEffect(() => {
    if (!currentUser || !receiver) return;

    const fetchMessages = async () => {
      const res = await fetch(
        `http://localhost:5000/messages?user1=${currentUser}&user2=${receiver}`
      );
      const data = await res.json();
      setMessages(data);
    };

    fetchMessages();
  }, [currentUser, receiver]);

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
            isOwn={msg.from === currentUser}
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
