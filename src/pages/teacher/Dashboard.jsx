import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BookOpen, Users, Wallet, MessageSquare, ChevronRight,
  AlertTriangle, Clock,
} from "lucide-react";
import client from "../../api/client";
import AppShell from "../../components/AppShell";
import Card from "../../components/ui/Card";
import Hero from "../../components/ui/Hero";
import IconTile from "../../components/ui/IconTile";
import { List, ListRow } from "../../components/ui/List";
import Badge from "../../components/ui/Badge";
import { useAuth } from "../../context/AuthContext";

const daysLeft = (iso) =>
  Math.max(0, Math.ceil((new Date(iso) - new Date()) / 86400000));

const tileTones = ["indigo", "violet", "emerald", "sky", "amber", "rose"];

export default function TeacherDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sub, setSub] = useState(null);
  const [batches, setBatches] = useState(null);

  useEffect(() => {
    client.get("/api/subscriptions/me/").then((res) => setSub(res.data));
    client.get("/api/batches/").then((res) => setBatches(res.data.results));
  }, []);

  const totalStudents = (batches || []).reduce(
    (n, b) => n + (b.student_count || 0), 0
  );

  return (
    <AppShell title="Dashboard">
      <div className="space-y-4">
        <p className="text-sm text-ink-600">
          স্বাগতম, {user?.first_name || "শিক্ষক"} 👋
        </p>

        {/* Hero — ব্যাচ ও subscription এক নজরে */}
        <Hero
          label="সক্রিয় ব্যাচ"
          value={
            batches === null ? "…" : `${batches.length}টি ব্যাচ`
          }
          icon={BookOpen}
          meta={
            <>
              <Users className="h-4 w-4" /> মোট {totalStudents} জন শিক্ষার্থী
            </>
          }
        >
          {sub?.active && sub.subscription && (
            <Link
              to="/teacher/subscription"
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold"
            >
              {sub.subscription.is_trial ? "Trial" : "Subscription"} ·
              {" "}{daysLeft(sub.subscription.end_date)} দিন বাকি
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </Hero>

        {/* Subscription অবস্থা — শুধু মনোযোগ দরকার হলে */}
        {sub &&
          (!sub.active ? (
            <Card className="flex items-start gap-3 border-warn/40">
              <IconTile icon={AlertTriangle} tone="amber" />
              <div>
                <p className="text-sm font-semibold">কোনো active subscription নেই</p>
                <p className="mt-0.5 text-xs text-ink-600">
                  Batch তৈরি করতে subscription লাগবে —{" "}
                  <Link
                    to="/teacher/subscription"
                    className="text-brand-600 hover:underline font-medium"
                  >
                    {sub.trial_available ? "free trial শুরু করুন" : "plan দেখুন"}
                  </Link>
                </p>
              </div>
            </Card>
          ) : daysLeft(sub.subscription.end_date) <= 7 ? (
            <Card className="flex items-start gap-3 border-warn/40">
              <IconTile icon={Clock} tone="amber" />
              <p className="text-sm">
                আপনার {sub.subscription.is_trial ? "trial" : "plan"}-এর মেয়াদ{" "}
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

        {/* Quick shortcuts */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { to: "/teacher/batches", label: "ব্যাচ", icon: Users, tone: "indigo" },
            { to: "/teacher/sms", label: "SMS", icon: MessageSquare, tone: "violet" },
            { to: "/teacher/subscription", label: "Subscription", icon: Wallet, tone: "emerald" },
          ].map((q) => (
            <Link key={q.to} to={q.to}>
              <Card className="flex flex-col items-center gap-2 p-3 text-center
                hover:border-brand-300 transition-colors">
                <IconTile icon={q.icon} tone={q.tone} />
                <span className="text-[11px] font-semibold">{q.label}</span>
              </Card>
            </Link>
          ))}
        </div>

        {/* Batches */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">আপনার Batch</h2>
            <Link
              to="/teacher/batches"
              className="text-xs text-brand-600 hover:underline font-medium"
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
            <List>
              {batches.slice(0, 5).map((b, i) => (
                <ListRow
                  key={b.id}
                  onClick={() => navigate(`/teacher/batches/${b.id}`)}
                  left={<IconTile icon={BookOpen} tone={tileTones[i % tileTones.length]} />}
                  title={b.name}
                  desc={b.subject || "Room খুলতে tap করুন"}
                  right={<Badge tone="slate">👥 {b.student_count}</Badge>}
                />
              ))}
            </List>
          )}
        </div>
      </div>
    </AppShell>
  );
}
