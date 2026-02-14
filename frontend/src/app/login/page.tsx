"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (data.token) {
        localStorage.setItem("token", data.token);
        router.push("/");
      } else {
        alert("Login failed");
      }
    } catch (err) {
      console.error(err);
      alert("Login error");
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#000",
      }}
    >
      <div
        style={{
          width: "350px",
          padding: "30px",
          border: "1px solid #222",
          borderRadius: "12px",
          backgroundColor: "#111",
        }}
      >
        <h2 style={{ marginBottom: "20px" }}>Login</h2>

        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "12px",
            backgroundColor: "#000",
            border: "1px solid #222",
            color: "#fff",
          }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "20px",
            backgroundColor: "#000",
            border: "1px solid #222",
            color: "#fff",
          }}
        />

        <button
          onClick={handleLogin}
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "#1a1a1a",
            border: "1px solid #222",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Login
        </button>
      </div>
    </div>
  );
}
