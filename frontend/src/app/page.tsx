"use client";

import AuthGate from "@/components/AuthGate";
import ChatLayout from "@/components/layout/ChatLayout";
import { ChatProvider } from "@/context/ChatContext";
import { useRouter } from "next/navigation";


export default function Home() {
  const router = useRouter();

  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
      return null;
    }
  }

  return (
    <AuthGate>
      <ChatProvider>
        <ChatLayout />
      </ChatProvider>
    </AuthGate>
  );
}
