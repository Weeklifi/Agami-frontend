import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { landingPath } from "../../lib/landing";
import AuthLayout from "../../components/AuthLayout";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import LangSwitcher from "../../components/LangSwitcher";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { t } = useTranslation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const user = await login(form.email, form.password);
      const next = params.get("next");
      if (next) navigate(next, { replace: true });
      else navigate(await landingPath(user), { replace: true });
    } catch {
      setError(t("loginError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title={t("login")} subtitle={t("loginSubtitle")}>
      {/* Language switcher — শুধু এই page-এ */}
      <div className="flex justify-end mb-4">
        <LangSwitcher />
      </div>
      <form onSubmit={submit} className="space-y-4">
        <Input
          label={t("email")}
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <Input
          label={t("password")}
          type="password"
          placeholder="••••••••"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        {error && <p className="text-sm text-err">{error}</p>}
        <Button type="submit" loading={loading}>
          {t("login")}
        </Button>
      </form>
      <p className="mt-5 text-center text-sm text-ink-600">
        {t("noAccount")}{" "}
        <Link to="/register" className="font-medium text-brand-600 hover:underline">
          {t("register")}
        </Link>
      </p>
    </AuthLayout>
  );
}