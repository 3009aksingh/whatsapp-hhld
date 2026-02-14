"use client";

import { useChat } from "@/context/ChatContext";
import useSocket from "@/hooks/useSocket";
import { jwtDecode } from "jwt-decode";
import { useEffect, useMemo, useState } from "react";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";

type DecodedToken = {
  username: string;
};

type Message = {
  _id?: string;
  from: string;
  to?: string;
  text: string;
};

export default function ChatWindow() {
  const { selectedUser } = useChat();
  const [messages, setMessages] = useState<Message[]>([]);

  // ✅ Safely decode user from token
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

  // 🔹 Clear messages when switching chats
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMessages([]);
  }, [receiver]);

  // 🔹 Fetch messages when userId OR receiver changes
  useEffect(() => {
    if (!userId || !receiver) return;

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
  }, [userId, receiver]);

  // 🔹 WebSocket

  const { setOnlineUsers } = useChat();
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
  
    if (msg.type === "online_users") {
      setOnlineUsers(msg.users);
    }
  });

  const sendMessage = (text: string) => {
    if (!socketRef.current || !userId || !receiver) return;

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

  // 🔹 Not logged in yet
  if (!userId) return null;

  // 🔹 No chat selected
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
      {/* Messages */}
      <div style={{ padding: "1rem", overflowY: "auto", flex: 1 }}>
        {messages.map((msg, index) => (
          <MessageBubble
            key={msg._id || index}
            text={msg.text}
            isOwn={msg.from === userId}
          />
        ))}
      </div>

      {/* Input */}
      <MessageInput onSend={sendMessage} />
    </div>
  );
}
