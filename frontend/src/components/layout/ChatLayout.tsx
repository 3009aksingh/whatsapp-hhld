import ChatWindow from "../chat/ChatWindow";
import Sidebar from "./Sidebar";

export default function ChatLayout() {
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
