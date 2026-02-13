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
    padding: "16px",
    borderTop: "1px solid #222",
    backgroundColor: "#0d0d0d",
  }}
>
<input
    style={{
      flex: 1,
      padding: "10px",
      backgroundColor: "#111",
      border: "1px solid #222",
      borderRadius: "6px",
      color: "#fff",
      outline: "none",
    }}
    value={text}
    onChange={(e) => setText(e.target.value)}
    placeholder="Type a message..."
  />
       <button
    onClick={handleSend}
    style={{
      marginLeft: "10px",
      padding: "10px 16px",
      backgroundColor: "#1a1a1a",
      border: "1px solid #222",
      color: "#fff",
      borderRadius: "6px",
      cursor: "pointer",
    }}
  >
        Send
      </button>
    </div>
  );
}
