"use client";

import { useSyncExternalStore } from "react";
import ChatWindow from "../chat/ChatWindow";
import Sidebar from "./Sidebar";

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

export default function ChatLayout() {
  const isClient = useIsClient();

  if (!isClient) return null;

  return (
    <div
      style={{
        width: "900px",
        height: "600px",
        display: "flex",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "14px",
        overflow: "hidden",
        backgroundColor: "rgba(17,17,17,0.8)",
        backdropFilter: "blur(8px)",
        boxShadow: "0 0 40px rgba(255,255,255,0.03)",
      }}
    >
      <Sidebar />
      <ChatWindow />
    </div>
  );
}
