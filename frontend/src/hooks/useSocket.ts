"use client";
import { useEffect, useRef } from "react";

type SocketMessage =
  | { type: "register"; userId: string }
  | { type: "message"; from: string; text: string };


export default function useSocket(
  userId: string,
  onMessage: (msg: SocketMessage) => void
) {
  const socketRef = useRef<WebSocket | null>(null);
  const messageHandlerRef = useRef<(msg: SocketMessage) => void>(onMessage);

  // Always keep latest handler
  useEffect(() => {
    messageHandlerRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:5000");
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("Connected to WebSocket");

      socket.send(
        JSON.stringify({
          type: "register",
          userId,
        })
      );
    };

    socket.onmessage = (event) => {
      const data: SocketMessage = JSON.parse(event.data);
      messageHandlerRef.current(data);
    };

    socket.onclose = () => {
      console.log("WebSocket disconnected");
    };

    return () => {
      socket.close();
    };
  }, [userId]);

  return socketRef;
}
