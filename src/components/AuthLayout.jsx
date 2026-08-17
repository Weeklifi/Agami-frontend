import Card from "./ui/Card";

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="min-h-dvh flex items-center justify-center px-4 py-10
      bg-[radial-gradient(1000px_500px_at_50%_-10%,#eef2ff_0%,transparent_60%)]">
      <div className="w-full max-w-sm">
        <div className="mb-7 text-center">
          <div className="grad-brand shadow-brand mx-auto mb-5 grid h-14 w-14
            place-items-center rounded-2xl text-2xl font-extrabold text-white">
            অ
          </div>
          <h1 className="text-xl font-bold">{title}</h1>
          {subtitle && (
            <p className="mt-1.5 text-sm text-ink-600">{subtitle}</p>
          )}
        </div>
        <Card className="p-5">{children}</Card>
      </div>
    </div>
  );
}
