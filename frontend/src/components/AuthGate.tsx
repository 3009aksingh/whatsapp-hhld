"use client";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  if (typeof window === "undefined") return null;

  const token = localStorage.getItem("token");

  if (!token) {
    window.location.replace("/login");
    return null;
  }

  return <>{children}</>;
}
