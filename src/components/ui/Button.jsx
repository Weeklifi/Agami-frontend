export default function Button({
  children,
  variant = "primary",
  loading = false,
  className = "",
  ...props
}) {
  const base =
    "inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full";

  const variants = {
    primary: "bg-brand-600 text-white hover:bg-brand-700",
    secondary:
      "bg-surface text-ink-900 border border-line hover:bg-page",
    ghost: "text-brand-600 hover:bg-brand-50",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? "অপেক্ষা করুন…" : children}
    </button>
  );
}