import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, GraduationCap, Check, AlertTriangle } from "lucide-react";
import client from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/ui/Button";

const ROLES = [
  {
    value: "TEACHER",
    icon: BookOpen,
    tone: "bg-brand-50 text-brand-600",
    title: "আমি শিক্ষক",
    desc: "Batch তৈরি করব, শিক্ষার্থী পরিচালনা করব, ক্লাস ও বেতনের হিসাব রাখব",
  },
  {
    value: "STUDENT",
    icon: GraduationCap,
    tone: "bg-violet-50 text-violet-600",
    title: "আমি শিক্ষার্থী",
    desc: "Batch-এ join করব, ক্লাসের নোটিশ, রুটিন ও নিজের payment status দেখব",
  },
];

export default function SelectRole() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const confirm = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await client.post("/api/auth/select-role/", {
        role: selected,
      });
      setUser(data.user);
      navigate(data.user.role === "TEACHER" ? "/teacher" : "/student", {
        replace: true,
      });
    } catch (err) {
      setError(err.response?.data?.role?.[0] || "কিছু একটা ভুল হয়েছে।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center px-4 py-10
      bg-[radial-gradient(1000px_500px_at_50%_-10%,#eef2ff_0%,transparent_60%)]">
      <div className="w-full max-w-lg">
        <div className="mb-7 text-center">
          <div className="grad-brand shadow-brand mx-auto mb-5 grid h-14 w-14
            place-items-center rounded-2xl text-2xl font-extrabold text-white">
            অ
          </div>
          <h1 className="text-xl font-bold">
            স্বাগতম{user?.first_name ? `, ${user.first_name}` : ""}!
          </h1>
          <p className="mt-1.5 text-sm text-ink-600">
            আপনি কীভাবে Agami ব্যবহার করবেন?
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {ROLES.map((r) => {
            const Icon = r.icon;
            const active = selected === r.value;
            return (
              <button
                key={r.value}
                type="button"
                onClick={() => setSelected(r.value)}
                className={`relative rounded-2xl border p-5 text-left transition-all
                  ${active
                    ? "border-brand-600 bg-brand-50/60 ring-2 ring-brand-100 shadow-soft"
                    : "border-line bg-surface shadow-soft hover:border-brand-300"
                  }`}
              >
                {active && (
                  <span className="absolute right-4 top-4 grid h-6 w-6 place-items-center
                    rounded-lg bg-brand-600 text-white">
                    <Check className="h-4 w-4" strokeWidth={3} />
                  </span>
                )}
                <div className={`mb-3 grid h-12 w-12 place-items-center rounded-2xl ${r.tone}`}>
                  <Icon className="h-6 w-6" strokeWidth={2} />
                </div>
                <div className="text-sm font-bold">{r.title}</div>
                <p className="mt-1 text-xs leading-relaxed text-ink-600">{r.desc}</p>
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2.5
          text-xs text-amber-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>সাবধানে নির্বাচন করুন — role একবার সেট হলে বদলানো যায় না।</span>
        </div>

        {error && <p className="mt-3 text-center text-sm text-err">{error}</p>}

        <div className="mt-5 max-w-xs mx-auto">
          <Button onClick={confirm} disabled={!selected} loading={loading}>
            নিশ্চিত করুন
          </Button>
        </div>
      </div>
    </div>
  );
}
