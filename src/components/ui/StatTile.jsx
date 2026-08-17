const tones = {
  ink: "text-ink-900",
  brand: "text-brand-600",
  ok: "text-ok",
  warn: "text-warn",
  err: "text-err",
};

/** ছোট stat টাইল — grid-এ ৩টা পাশাপাশি (উপস্থিত/অনুপস্থিত ইত্যাদি)। */
export default function StatTile({ value, label, tone = "ink" }) {
  return (
    <div className="rounded-2xl border border-line bg-surface shadow-soft py-3 text-center">
      <div className={`text-lg font-extrabold ${tones[tone]}`}>{value}</div>
      <div className="mt-0.5 text-[11px] text-ink-400">{label}</div>
    </div>
  );
}
