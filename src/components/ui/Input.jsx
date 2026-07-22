export default function Input({ label, error, ...props }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-ink-900">
          {label}
        </label>
      )}
      <input
        className={`w-full rounded-lg border bg-surface px-3.5 py-2.5 text-sm
          placeholder:text-ink-400 outline-none transition-colors
          focus:border-brand-500 focus:ring-2 focus:ring-brand-100
          ${error ? "border-err" : "border-line"}`}
        {...props}
      />
      {error && <p className="text-sm text-err">{error}</p>}
    </div>
  );
}