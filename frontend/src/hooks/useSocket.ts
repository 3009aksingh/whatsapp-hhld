"use client";
import { useEffect, useRef } from "react";

type SocketMessage =
  | { type: "message"; from: string; text: string }
  | { type: "online_users"; users: string[] };

export default function useSocket(
  onMessage: (msg: SocketMessage) => void
) {
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("No token found");
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
      onMessage(data);
    };

    socket.onclose = () => {
      console.log("WebSocket disconnected");
    };

    return () => {
      socket.close();
    };
  }, [onMessage]);

  return socketRef;
}
