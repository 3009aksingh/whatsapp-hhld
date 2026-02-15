"use client";

import { useEffect, useRef } from "react";

/* =========================
   Define Proper Socket Types
========================= */

export type SocketMessage =
  | {
      type: "message";
      id: string;       // ✅ REQUIRED now
      from: string;
      text: string;
    }
  | {
      type: "online_users";
      users: string[];
    };

export default function useSocket(
  onMessage: (msg: SocketMessage) => void
) {
  const socketRef = useRef<WebSocket | null>(null);
  const messageHandlerRef = useRef(onMessage);

  /* =========================
     Keep Latest Handler
  ========================= */

  useEffect(() => {
    messageHandlerRef.current = onMessage;
  }, [onMessage]);

  /* =========================
     WebSocket Lifecycle
  ========================= */

  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("token");

    if (!token) {
      console.log("WebSocket not started — no token");
      return;
    }

    const WS_PORT =
      localStorage.getItem("ws_port") || "5000";

    const socket = new WebSocket(
      `ws://localhost:${WS_PORT}?token=${token}`
    );

    socketRef.current = socket;

    socket.onopen = () => {
      console.log(
        `WebSocket connected to ${WS_PORT}`
      );
    };

    socket.onmessage = (event) => {
      try {
        const data: SocketMessage = JSON.parse(
          event.data
        );

        messageHandlerRef.current(data);
      } catch (err) {
        console.error(
          "Invalid WebSocket message",
          err
        );
      }
    };

    socket.onclose = () => {
      console.log("WebSocket disconnected");
    };

    socket.onerror = (err) => {
      console.log("WebSocket error:", err);
    };

    return () => {
      if (
        socket.readyState === WebSocket.OPEN
      ) {
        console.log(
          "Cleaning up socket..."
        );
        socket.close();
      }
    };
  }, []);

  return socketRef;
}
