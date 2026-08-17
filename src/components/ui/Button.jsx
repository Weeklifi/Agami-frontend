export default function Button({
  children,
  variant = "primary",
  loading = false,
  className = "",
  ...props
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed w-full active:scale-[.99]";

  const variants = {
    primary: "grad-brand text-white shadow-brand hover:brightness-105",
    secondary: "bg-surface text-ink-900 border border-line shadow-soft hover:bg-page",
    ghost: "text-brand-600 hover:bg-brand-50",
    danger: "bg-err text-white hover:brightness-105",
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
