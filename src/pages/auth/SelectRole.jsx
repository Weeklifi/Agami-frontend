import { useState } from "react";
import { useNavigate } from "react-router-dom";
import client from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/ui/Button";

const ROLES = [
  {
    value: "TEACHER",
    icon: "🎓",
    title: "আমি শিক্ষক",
    desc: "Batch তৈরি করব, শিক্ষার্থী পরিচালনা করব, ক্লাস ও বেতনের হিসাব রাখব",
  },
  {
    value: "STUDENT",
    icon: "📚",
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
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <div className="text-2xl font-bold text-brand-600 mb-6">Agami</div>
          <h1 className="text-xl font-semibold">
            স্বাগতম{user?.first_name ? `, ${user.first_name}` : ""}!
          </h1>
          <p className="mt-1.5 text-sm text-ink-600">
            আপনি কীভাবে Agami ব্যবহার করবেন? এটি পরে বদলানো যাবে না।
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {ROLES.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => setSelected(r.value)}
              className={`rounded-xl border p-5 text-left transition-all
                ${
                  selected === r.value
                    ? "border-brand-600 bg-brand-50 ring-2 ring-brand-100"
                    : "border-line bg-surface hover:border-ink-400"
                }`}
            >
              <div className="text-2xl mb-2">{r.icon}</div>
              <div className="font-semibold text-sm">{r.title}</div>
              <p className="mt-1 text-xs text-ink-600 leading-relaxed">
                {r.desc}
              </p>
            </button>
          ))}
        </div>

        {error && <p className="mt-4 text-center text-sm text-err">{error}</p>}

        <div className="mt-6 max-w-xs mx-auto">
          <Button onClick={confirm} disabled={!selected} loading={loading}>
            নিশ্চিত করুন
          </Button>
        </div>
      </div>
    </div>
  );
}