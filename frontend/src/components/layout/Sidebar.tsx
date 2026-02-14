"use client";

import { useChat } from "@/context/ChatContext";
import { useEffect, useState } from "react";

type User = {
  username: string;
};

export default function Sidebar() {
  const [users, setUsers] = useState<User[]>([]);
  const { selectedUser, setSelectedUser, onlineUsers } = useChat();

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  const currentUser = token
    ? JSON.parse(atob(token.split(".")[1])).username
    : "";

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await fetch("http://localhost:5000/users");
      const data = await res.json();

      const filteredUsers = data.filter(
        (u: User) => u.username !== currentUser
      );

      setUsers(filteredUsers);

      // Auto-select first user
      if (filteredUsers.length > 0 && !selectedUser) {
        setSelectedUser(filteredUsers[0].username);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div
      style={{
        width: "30%",
        borderRight: "1px solid #1f1f1f",
        backgroundColor: "#0d0d0d",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "20px",
          borderBottom: "1px solid #1f1f1f",
          fontSize: "16px",
          fontWeight: 500,
        }}
      >
        Chats
      </div>

      {/* User List */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px" }}>
        {users.map((user) => (
          <div
            key={user.username}
            onClick={() => setSelectedUser(user.username)}
            style={{
              padding: "10px 12px",
              borderRadius: "8px",
              cursor: "pointer",
              marginBottom: "6px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor:
                selectedUser === user.username
                  ? "#1a1a1a"
                  : "transparent",
              border:
                selectedUser === user.username
                  ? "1px solid #2a2a2a"
                  : "1px solid transparent",
            }}
          >
            <span>{user.username}</span>

            {onlineUsers.includes(user.username) && (
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: "#4ade80",
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
