import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, Lock, Gift, ChevronRight, AlertTriangle } from "lucide-react";
import client from "../../api/client";
import AppShell from "../../components/AppShell";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Hero from "../../components/ui/Hero";

const daysLeft = (iso) =>
  Math.max(0, Math.ceil((new Date(iso) - new Date()) / 86400000));

export default function Subscription() {
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    client.get("/api/subscriptions/me/").then((res) => setStatus(res.data));
  };

  useEffect(load, []);

  const startTrial = async () => {
    setBusy(true);
    setError("");
    try {
      await client.post("/api/subscriptions/trial/");
      load();
    } catch (err) {
      setError(err.response?.data?.detail || "ব্যর্থ হয়েছে।");
    } finally {
      setBusy(false);
    }
  };

  if (!status)
    return (
      <AppShell title="Subscription">
        <p className="text-sm text-ink-400">লোড হচ্ছে…</p>
      </AppShell>
    );

  const sub = status.subscription;
  const left = status.active ? daysLeft(sub.end_date) : 0;
  // ট্রায়াল ৩০ দিন ধরে অগ্রগতি বার — আনুমানিক
  const pct = status.active ? Math.max(6, Math.min(100, (left / 30) * 100)) : 0;

  return (
    <AppShell title="Subscription">
      <div className="space-y-4 max-w-2xl">
        {status.active ? (
          <>
            <Hero
              label="বর্তমান Plan"
              value={sub.is_trial ? "Free Trial" : sub.plan?.name || "Plan"}
              tone={left <= 7 ? "violet" : "brand"}
              meta={
                <>
                  <Clock className="h-4 w-4" /> মেয়াদ শেষ:{" "}
                  {new Date(sub.end_date).toLocaleDateString("bn-BD", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}{" "}
                  · {left} দিন বাকি
                </>
              }
            >
              <div className="mt-3 h-1.5 rounded-full bg-white/25">
                <div
                  className="h-full rounded-full bg-white"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </Hero>

            {sub.is_trial && (
              <div className="flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2.5
                text-xs text-amber-700">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>Trial শেষ হওয়ার আগে একটি plan কিনুন — নিরবচ্ছিন্ন সেবা পেতে।</span>
              </div>
            )}

            <Button onClick={() => navigate("/teacher/plans")}>
              {sub.is_trial ? "Plan কিনুন" : "Plan পরিবর্তন / নবায়ন"}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <Card className="text-center py-8">
            <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl
              bg-slate-100 text-slate-500">
              <Lock className="h-7 w-7" />
            </div>
            <p className="text-base font-bold mb-1">কোনো active subscription নেই</p>
            <p className="text-sm text-ink-600 mb-5 px-4">
              Batch তৈরি ও পরিচালনা করতে subscription প্রয়োজন।
            </p>
            <div className="flex flex-col gap-2 px-4">
              <Button onClick={() => navigate("/teacher/plans")}>Purchase now</Button>
              {status.trial_available && (
                <Button variant="secondary" onClick={startTrial} loading={busy}>
                  <Gift className="h-4 w-4" /> ৩০ দিনের Free Trial
                </Button>
              )}
            </div>
          </Card>
        )}

        {error && (
          <div className="rounded-xl bg-red-50 p-3 text-sm text-err">{error}</div>
        )}
      </div>
    </AppShell>
  );
}
