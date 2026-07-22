import LangSwitcher from "./LangSwitcher";

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="min-h-dvh bg-page flex items-start sm:items-center justify-center px-4 py-10 sm:py-12">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-brand-600">Agami</h1>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-6 sm:p-7">
          <h2 className="text-lg font-semibold">{title}</h2>
          {subtitle && (
            <p className="mt-1 text-sm text-ink-600">{subtitle}</p>
          )}
          <div className="mt-5">{children}</div>
        </div>
      </div>
    </div>
  );
}