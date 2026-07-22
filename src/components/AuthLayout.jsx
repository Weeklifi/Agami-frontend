import Card from "./ui/Card";

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="text-2xl font-bold text-brand-600 mb-6">Agami</div>
          <h1 className="text-xl font-semibold">{title}</h1>
          {subtitle && (
            <p className="mt-1.5 text-sm text-ink-600">{subtitle}</p>
          )}
        </div>
        <Card>{children}</Card>
      </div>
    </div>
  );
}