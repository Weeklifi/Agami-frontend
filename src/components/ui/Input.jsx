export default function Input({ label, error, icon: Icon, className = "", ...props }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-ink-700">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
        )}
        <input
          className={`w-full rounded-xl border bg-surface py-3 text-sm
            placeholder:text-ink-400 outline-none transition-colors
            focus:border-brand-500 focus:ring-2 focus:ring-brand-100
            ${Icon ? "pl-9 pr-3.5" : "px-3.5"}
            ${error ? "border-err" : "border-line"} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-sm text-err">{error}</p>}
    </div>
  );
}
