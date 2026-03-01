"use client";

import { useEffect, useRef } from "react";

/* =========================
   Socket Message Types
========================= */

export type SocketMessage =
  | {
      type: "message";
      id: string;
      from: string;
      text: string;
    }
  | {
      type: "online_users";
      users: string[];
    };

/* =========================
   useSocket Hook
========================= */

export default function useSocket(
  onMessage: (msg: SocketMessage) => void
) {
  const socketRef = useRef<WebSocket | null>(null);
  const messageHandlerRef = useRef(onMessage);

  /* Keep latest handler */
  useEffect(() => {
    messageHandlerRef.current = onMessage;
  }, [onMessage]);

  /* WebSocket Lifecycle */
  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("token");
    if (!token) {
      console.log("WebSocket not started — no token");
      return;
    }

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL;

    if (!wsUrl) {
      console.error("NEXT_PUBLIC_WS_URL is not defined");
      return;
    }

    const socket = new WebSocket(`${wsUrl}?token=${token}`);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("✅ WebSocket connected");
    };

    socket.onmessage = (event) => {
      try {
        const data: SocketMessage = JSON.parse(event.data);
        messageHandlerRef.current(data);
      } catch (err) {
        console.error("Invalid WebSocket message:", err);
      }
    };

    socket.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    socket.onclose = () => {
      console.log("❌ WebSocket disconnected");
    };

    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, []);

  return socketRef;
}