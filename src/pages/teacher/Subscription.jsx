import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import client from "../../api/client";
import AppShell from "../../components/AppShell";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";

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

  return (
    <AppShell title="Subscription">
      <div className="space-y-5 max-w-2xl">
        <Card>
          {status.active ? (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-ink-400 mb-0.5">বর্তমান plan</p>
                  <h2 className="text-base font-bold">
                    {sub.is_trial ? "🎁 Free Trial" : sub.plan?.name}
                  </h2>
                </div>
                <Badge tone={daysLeft(sub.end_date) <= 7 ? "warn" : "ok"}>
                  {daysLeft(sub.end_date)} দিন বাকি
                </Badge>
              </div>
              <p className="mt-2 text-xs text-ink-600">
                মেয়াদ শেষ:{" "}
                {new Date(sub.end_date).toLocaleDateString("bn-BD", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
              {sub.is_trial && (
                <div className="mt-3 rounded-lg bg-amber-50 p-3 text-xs text-warn">
                  ⏳ Trial শেষ হওয়ার আগে একটি plan কিনুন — নিরবচ্ছিন্ন সেবা পেতে।
                </div>
              )}
              <div className="mt-4">
                <Button
                  className="!w-auto px-6"
                  onClick={() => navigate("/teacher/plans")}
                >
                  {sub.is_trial ? "🚀 Plan কিনুন" : "Plan পরিবর্তন / নবায়ন"}
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="text-3xl mb-2">🔒</div>
              <p className="text-base font-semibold mb-1">
                কোনো active subscription নেই
              </p>
              <p className="text-sm text-ink-600 mb-4">
                Batch তৈরি ও পরিচালনা করতে subscription প্রয়োজন।
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button
                  className="!w-auto px-6"
                  onClick={() => navigate("/teacher/plans")}
                >
                  💳 Purchase now
                </Button>
                {status.trial_available && (
                  <Button
                    variant="secondary"
                    className="!w-auto px-6"
                    onClick={startTrial}
                    loading={busy}
                  >
                    🎁 ৩০ দিনের Free Trial
                  </Button>
                )}
              </div>
            </div>
          )}
        </Card>

        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-err">
            {error}
          </div>
        )}
      </div>
    </AppShell>
  );
}