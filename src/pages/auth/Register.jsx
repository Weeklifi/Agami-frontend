import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, ShieldCheck, BookOpen, GraduationCap, Check } from "lucide-react";
import client from "../../api/client";
import AuthLayout from "../../components/AuthLayout";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

const ROLES = [
  {
    value: "TEACHER",
    icon: BookOpen,
    tone: "bg-brand-50 text-brand-600",
    title: "আমি শিক্ষক",
  },
  {
    value: "STUDENT",
    icon: GraduationCap,
    tone: "bg-violet-50 text-violet-600",
    title: "আমি শিক্ষার্থী",
  },
];

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    role: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.role) {
      setErrors({ role: ["আপনি শিক্ষক নাকি শিক্ষার্থী তা বেছে নিন।"] });
      return;
    }
    setLoading(true);
    setErrors({});
    try {
      await client.post("/api/auth/users/", form);
      navigate("/check-email", { state: { email: form.email } });
    } catch (err) {
      setErrors(err.response?.data || { detail: "কিছু একটা ভুল হয়েছে।" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Account তৈরি করুন"
      subtitle="কোচিং পরিচালনা হোক আরও সহজ"
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-700">
            আপনি কী হিসেবে যোগ দিচ্ছেন?
          </label>
          <div className="grid grid-cols-2 gap-3">
            {ROLES.map((r) => {
              const Icon = r.icon;
              const active = form.role === r.value;
              return (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setForm({ ...form, role: r.value })}
                  className={`relative flex items-center gap-2.5 rounded-xl border p-3
                    text-left transition-all
                    ${active
                      ? "border-brand-600 bg-brand-50/60 ring-2 ring-brand-100"
                      : "border-line bg-surface hover:border-brand-300"
                    }`}
                >
                  <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${r.tone}`}>
                    <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
                  </div>
                  <span className="text-sm font-semibold">{r.title}</span>
                  {active && (
                    <span className="absolute right-2.5 top-2.5 grid h-5 w-5
                      place-items-center rounded-full bg-brand-600 text-white">
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {errors.role && (
            <p className="mt-1.5 text-xs text-err">{errors.role[0]}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="নাম"
            placeholder="রহিম"
            value={form.first_name}
            onChange={set("first_name")}
            error={errors.first_name?.[0]}
          />
          <Input
            label="পদবি"
            placeholder="উদ্দিন"
            value={form.last_name}
            onChange={set("last_name")}
            error={errors.last_name?.[0]}
          />
        </div>
        <Input
          label="Email"
          icon={Mail}
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={set("email")}
          error={errors.email?.[0]}
        />
        <Input
          label="Password"
          icon={Lock}
          type="password"
          placeholder="••••••••"
          value={form.password}
          onChange={set("password")}
          error={errors.password?.[0]}
        />
        {errors.detail && <p className="text-sm text-err">{errors.detail}</p>}
        <div className="flex items-start gap-2 rounded-xl bg-brand-50 px-3 py-2.5
          text-xs text-brand-700">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
          <span>আপনার তথ্য সুরক্ষিত ও এনক্রিপ্টেড থাকে।</span>
        </div>
        <Button type="submit" loading={loading}>
          Account তৈরি করুন
        </Button>
      </form>
      <p className="mt-5 text-center text-sm text-ink-600">
        আগে থেকেই account আছে?{" "}
        <Link to="/login" className="font-medium text-brand-600 hover:underline">
          Login করুন
        </Link>
      </p>
    </AuthLayout>
  );
}
