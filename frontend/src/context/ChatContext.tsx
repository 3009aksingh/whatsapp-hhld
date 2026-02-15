"use client";

import useSocket from "@/hooks/useSocket";
import { createContext, useContext, useState } from "react";

type Message = {
  from: string;
  text: string;
};

type ChatContextType = {
  currentUser: string;
  selectedUser: string;
  setSelectedUser: (user: string) => void;
  onlineUsers: string[];
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  sendMessage: (to: string, text: string) => void;
  logout: () => void;
};

const ChatContext = createContext<ChatContextType | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {

  // 🔥 Decode token ONCE here
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  const currentUser = token
    ? JSON.parse(atob(token.split(".")[1])).username
    : "";

  const [selectedUser, setSelectedUser] = useState("");
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  const socketRef = useSocket((msg) => {
    if (msg.type === "online_users") {
      setOnlineUsers(msg.users);
    }

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

  const sendMessage = (to: string, text: string) => {
    if (!socketRef.current) return;

    socketRef.current.send(
      JSON.stringify({
        type: "message",
        to,
        text,
      })
    );
  };

  const logout = () => {
    if (socketRef.current) {
      socketRef.current.close();
    }

    localStorage.removeItem("token");
    window.location.replace("/login");
  };

  return (
    <ChatContext.Provider
      value={{
        currentUser,
        selectedUser,
        setSelectedUser,
        onlineUsers,
        messages,
        setMessages,
        sendMessage,
        logout,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) throw new Error("useChat must be used within ChatProvider");
  return context;
}
