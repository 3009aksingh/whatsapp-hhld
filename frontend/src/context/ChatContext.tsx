"use client";

import useSocket from "@/hooks/useSocket";
import { createContext, useContext, useMemo, useState } from "react";

type Message = {
  id: string;        // ✅ REQUIRED
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

type IncomingSocketMessage =
  | {
      type: "online_users";
      users: string[];
    }
  | {
      type: "message";
      id: string;       // ✅ now TS knows id exists
      from: string;
      text: string;
    };


export function ChatProvider({ children }: { children: React.ReactNode }) {

  /* =========================
     Decode token safely
  ========================= */

  const currentUser = useMemo(() => {
    if (typeof window === "undefined") return "";

    const token = localStorage.getItem("token");
    if (!token) return "";

    try {
      return JSON.parse(atob(token.split(".")[1])).username;
    } catch {
      return "";
    }
  }, []);

  const [selectedUser, setSelectedUser] = useState("");
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  /* =========================
     WebSocket Handler
  ========================= */

  const socketRef = useSocket((msg) => {
    if (msg.type === "online_users") {
      setOnlineUsers(msg.users);
    }

    if (msg.type === "message") {

      // ✅ DEDUPLICATION BY MESSAGE ID
      setMessages((prev) => {

        // If message already exists → ignore
          if (prev.some((m) => m.id === msg.id)) {
            return prev;
          }

          return [
            ...prev,
            {
              id: msg.id,
              from: msg.from,
              text: msg.text,
            },
          ];
      });
    }
  });

  /* =========================
     Send Message
  ========================= */

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

  /* =========================
     Logout
  ========================= */

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
