import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Flame, ShieldCheck } from "lucide-react";
import client from "../../api/client";
import AppShell from "../../components/AppShell";
import Button from "../../components/ui/Button";

const FEATURES = [
  "সীমাহীন batch তৈরি",
  "সীমাহীন শিক্ষার্থী",
  "নোটিশ, পরীক্ষা ও ফলাফল",
  "ক্লাস রুটিন ব্যবস্থাপনা",
  "বেতন আদায়ের হিসাব",
  "Email ও in-app notification",
];

export default function Plans() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState(null);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    client
      .get("/api/subscriptions/plans/")
      .then((res) => setPlans(res.data.results || res.data));
    client.get("/api/subscriptions/me/").then((res) => setStatus(res.data));
  }, []);

  const currentPlanId =
    status?.subscription && !status.subscription.is_trial
      ? status.subscription.plan?.id
      : null;

  const isPopular = (p) => p.interval === "YEARLY";

  const selectPlan = (plan) => navigate(`/teacher/checkout/${plan.id}`);

  return (
    <AppShell title="Plans">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold">সঠিক plan বেছে নিন</h1>
          <p className="mt-1.5 text-sm text-ink-600">
            যেকোনো সময় upgrade বা বাতিল করতে পারবেন। কোনো লুকানো খরচ নেই।
          </p>
        </div>

        {plans === null ? (
          <p className="text-center text-sm text-ink-400">লোড হচ্ছে…</p>
        ) : plans.length === 0 ? (
          <p className="text-center text-sm text-ink-400">কোনো plan পাওয়া যায়নি।</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {plans.map((p) => {
              const popular = isPopular(p);
              const isCurrent = currentPlanId === p.id;
              return (
                <div
                  key={p.id}
                  className={`relative flex flex-col rounded-2xl border bg-surface p-6 shadow-soft
                    ${popular ? "border-2 border-brand-600 shadow-pop" : "border-line"}`}
                >
                  {popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex
                      items-center gap-1 rounded-full grad-brand px-3 py-1 text-xs
                      font-semibold text-white shadow-brand">
                      <Flame className="h-3.5 w-3.5" /> সবচেয়ে জনপ্রিয়
                    </span>
                  )}

                  <h3 className="text-lg font-bold">{p.name}</h3>
                  <p className="mt-1 text-xs text-ink-400">
                    {p.interval === "MONTHLY" ? "মাসিক বিলিং" : "বার্ষিক বিলিং"}
                  </p>

                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold tracking-tight">
                      ৳{Math.round(p.price)}
                    </span>
                    <span className="text-sm text-ink-400">
                      /{p.interval === "MONTHLY" ? "মাস" : "বছর"}
                    </span>
                  </div>

                  {p.interval === "YEARLY" && (
                    <p className="mt-1 text-xs font-medium text-ok">
                      মাসিকের চেয়ে সাশ্রয়ী 💰
                    </p>
                  )}

                  <ul className="mt-5 flex-1 space-y-2.5">
                    {FEATURES.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <span className="mt-0.5 grid h-4 w-4 place-items-center rounded-full
                          bg-emerald-50 text-ok">
                          <Check className="h-3 w-3" strokeWidth={3} />
                        </span>
                        <span className="text-ink-600">{f}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6">
                    {isCurrent ? (
                      <Button variant="secondary" disabled>
                        ✓ বর্তমান plan
                      </Button>
                    ) : (
                      <Button
                        variant={popular ? "primary" : "secondary"}
                        onClick={() => selectPlan(p)}
                      >
                        এই plan নিন
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-xs
          text-ink-400">
          <ShieldCheck className="h-4 w-4" /> নিরাপদ payment · যেকোনো সময় বাতিলযোগ্য
        </p>
      </div>
    </AppShell>
  );
}
