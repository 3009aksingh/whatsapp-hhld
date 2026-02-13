"use client";
import { useState } from "react";

type Props = {
  onSend: (text: string) => void;
};

export default function MessageInput({ onSend }: Props) {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text);
    setText("");
  };

  return (
    <div
      style={{
        display: "flex",
        padding: "1rem",
        borderTop: "1px solid #ddd"
      }}
    >
      <input
        style={{ flex: 1, padding: "8px" }}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type a message..."
      />
      <button onClick={handleSend} style={{ marginLeft: "10px" }}>
        Send
      </button>
    </div>
  );
}
