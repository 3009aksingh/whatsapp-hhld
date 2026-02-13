type Props = {
  text: string;
  isOwn?: boolean;
};

export default function MessageBubble({ text, isOwn }: Props) {
  return (
    <div
      style={{
        textAlign: isOwn ? "right" : "left",
        margin: "8px 0"
      }}
    >
      <span
        style={{
          display: "inline-block",
          padding: "8px 12px",
          borderRadius: "12px",
          backgroundColor: isOwn ? "#DCF8C6" : "#eee"
        }}
      >
        {text}
      </span>
    </div>
  );
}
