"use client";

import { createContext, useContext, useState } from "react";

type ChatContextType = {
  selectedUser: string;
  setSelectedUser: (user: string) => void;
  onlineUsers: string[];
  setOnlineUsers: (users: string[]) => void;
};

const ChatContext = createContext<ChatContextType | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [selectedUser, setSelectedUser] = useState("");
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  return (
    <ChatContext.Provider
      value={{ selectedUser, setSelectedUser, onlineUsers, setOnlineUsers }}
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
