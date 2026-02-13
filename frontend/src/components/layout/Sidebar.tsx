export default function Sidebar() {
  return (
    <div
      style={{
        width: "25%",
        borderRight: "1px solid #ddd",
        padding: "1rem"
      }}
    >
      <h2>Chats</h2>

      <div style={{ marginTop: "1rem", cursor: "pointer" }}>
        User A
      </div>

      <div style={{ marginTop: "1rem", cursor: "pointer" }}>
        User B
      </div>
    </div>
  );
}
