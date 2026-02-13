type Props = {
  text: string;
  isOwn?: boolean;
};

export default function MessageBubble({ text, isOwn }: Props) {
  return (
    <div
      style={{
        textAlign: isOwn ? "right" : "left",
        margin: "10px 0",
      }}
    >
      <span
        style={{
          display: "inline-block",
          padding: "10px 14px",
          borderRadius: "8px",
          backgroundColor: isOwn ? "#1f1f1f" : "#181818",
          border: "1px solid #222",
          fontSize: "14px",
        }}
      >
        {text}
      </span>
    </div>
  );
}
