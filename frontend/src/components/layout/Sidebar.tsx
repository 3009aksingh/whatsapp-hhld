"use client";

import { useState } from "react";

const users = ["userA", "userB"];

export default function Sidebar() {
  const [selectedUser, setSelectedUser] = useState("userA");

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
          letterSpacing: "0.5px",
        }}
      >
        Chats
      </div>

      {/* Chat List */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "12px",
        }}
      >
        {users.map((user) => (
          <div
            key={user}
            onClick={() => setSelectedUser(user)}
            style={{
              padding: "10px 12px",
              borderRadius: "8px",
              cursor: "pointer",
              marginBottom: "6px",
              fontSize: "14px",
              backgroundColor:
                selectedUser === user ? "#1a1a1a" : "transparent",
              border:
                selectedUser === user
                  ? "1px solid #2a2a2a"
                  : "1px solid transparent",
              transition: "all 0.2s ease",
            }}
          >
            {user}
          </div>
        ))}
      </div>
    </div>
  );
}
