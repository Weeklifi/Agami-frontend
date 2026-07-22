const styles = {
  ok: "bg-emerald-50 text-ok",
  warn: "bg-amber-50 text-warn",
  err: "bg-red-50 text-err",
  neutral: "bg-page text-ink-600",
};

export default function Badge({ children, tone = "neutral" }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5
        text-xs font-medium ${styles[tone]}`}
    >
      {children}
    </span>
  );
}