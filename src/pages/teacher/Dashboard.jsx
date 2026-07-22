import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import client from "../../api/client";
import AppShell from "../../components/AppShell";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import { useAuth } from "../../context/AuthContext";

const daysLeft = (iso) =>
  Math.max(0, Math.ceil((new Date(iso) - new Date()) / 86400000));

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [sub, setSub] = useState(null);
  const [batches, setBatches] = useState(null);

  useEffect(() => {
    client.get("/api/subscriptions/me/").then((res) => setSub(res.data));
    client.get("/api/batches/").then((res) => setBatches(res.data.results));
  }, []);

  return (
    <AppShell title="Dashboard">
      <div className="space-y-4">
        <p className="text-sm text-ink-600">
          স্বাগতম, {user?.first_name || "শিক্ষক"} 👋
        </p>

        {/* Subscription অবস্থা — শুধু মনোযোগ দরকার হলে বড় করে */}
        {sub &&
          (!sub.active ? (
            <Card className="border-warn">
              <p className="text-sm font-medium">
                কোনো active subscription নেই
              </p>
              <p className="mt-1 text-xs text-ink-600">
                Batch তৈরি করতে subscription লাগবে —{" "}
                <Link
                  to="/teacher/subscription"
                  className="text-brand-600 hover:underline font-medium"
                >
                  {sub.trial_available ? "free trial শুরু করুন" : "plan দেখুন"}
                </Link>
              </p>
            </Card>
          ) : daysLeft(sub.subscription.end_date) <= 7 ? (
            <Card className="border-warn">
              <p className="text-sm">
                ⏳ আপনার {sub.subscription.is_trial ? "trial" : "plan"}-এর
                মেয়াদ{" "}
                <span className="font-semibold">
                  {daysLeft(sub.subscription.end_date)} দিন
                </span>{" "}
                পরে শেষ —{" "}
                <Link
                  to="/teacher/subscription"
                  className="text-brand-600 hover:underline font-medium"
                >
                  renew করুন
                </Link>
              </p>
            </Card>
          ) : null)}

        {/* Batches */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">আপনার Batch</h2>
            <Link
              to="/teacher/batches"
              className="text-xs text-brand-600 hover:underline"
            >
              সব দেখুন →
            </Link>
          </div>
          {batches === null ? (
            <p className="text-sm text-ink-400">লোড হচ্ছে…</p>
          ) : batches.length === 0 ? (
            <Card className="text-center py-8">
              <p className="text-sm text-ink-600">এখনো কোনো batch নেই</p>
              <Link
                to="/teacher/batches"
                className="mt-1 inline-block text-xs text-brand-600 hover:underline"
              >
                প্রথম batch তৈরি করুন →
              </Link>
            </Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {batches.slice(0, 4).map((b) => (
                <Link key={b.id} to={`/teacher/batches/${b.id}`}>
                  <Card className="hover:border-brand-500 transition-colors">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-sm">{b.name}</h3>
                      <Badge tone="neutral">👥 {b.student_count}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-ink-400">
                      Room খুলতে tap করুন
                    </p>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}