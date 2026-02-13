import ChatWindow from "../chat/ChatWindow";
import Sidebar from "./Sidebar";

export default function ChatLayout() {
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar />
      <ChatWindow />
    </div>
  );
}
