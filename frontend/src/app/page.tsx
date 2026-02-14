"use client";

import ChatLayout from "@/components/layout/ChatLayout";
import { ChatProvider } from "@/context/ChatContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    }
  }, []);

  return (
    <ChatProvider>
      <ChatLayout />
    </ChatProvider>
  );
}
