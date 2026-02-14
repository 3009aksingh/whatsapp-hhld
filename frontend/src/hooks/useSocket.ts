"use client";

import { useEffect, useRef } from "react";

type SocketMessage =
  | { type: "message"; from: string; text: string }
  | { type: "online_users"; users: string[] };

export default function useSocket(
  onMessage: (msg: SocketMessage) => void
) {
  const socketRef = useRef<WebSocket | null>(null);
  const messageHandlerRef = useRef(onMessage);

  useEffect(() => {
    messageHandlerRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("token");

    // 🔴 DO NOT CONNECT if no token
    if (!token) {
      console.log("WebSocket not started — no token");
      return;
    }

    const socket = new WebSocket(
      `ws://localhost:5000?token=${token}`
    );

    socketRef.current = socket;

    socket.onopen = () => {
      console.log("WebSocket connected");
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      messageHandlerRef.current(data);
    };

    socket.onclose = () => {
      console.log("WebSocket disconnected");
    };

    socket.onerror = (err) => {
      console.log("WebSocket error:", err);
    };

    return () => {
      socket.close();
    };
  }, []); // only once

  return socketRef;
}
