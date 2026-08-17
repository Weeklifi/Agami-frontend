export default function Card({ children, className = "", as: Tag = "div", ...props }) {
  return (
    <Tag
      className={`rounded-2xl border border-line bg-surface p-4 shadow-soft ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
}
