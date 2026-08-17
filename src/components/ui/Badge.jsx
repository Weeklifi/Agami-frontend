const styles = {
  ok: "bg-emerald-50 text-ok",
  warn: "bg-amber-50 text-warn",
  err: "bg-red-50 text-err",
  neutral: "bg-page text-ink-600",
  indigo: "bg-brand-50 text-brand-600",
  violet: "bg-violet-50 text-violet-600",
  sky: "bg-sky-50 text-sky-600",
  slate: "bg-slate-100 text-slate-600",
};

export default function Badge({ children, tone = "neutral", className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5
        text-xs font-semibold ${styles[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
