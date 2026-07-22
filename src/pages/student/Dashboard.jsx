import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import client from "../../api/client";
import AppShell from "../../components/AppShell";
import Card from "../../components/ui/Card";
import { useAuth } from "../../context/AuthContext";
import { formatDateTime } from "../../lib/postTypes";

// JS getDay(): রবি=0..শনি=6 → Python weekday: সোম=0..রবি=6
const todayPy = (new Date().getDay() + 6) % 7;

export default function StudentDashboard() {
  const { user } = useAuth();
  const [exams, setExams] = useState(null);
  const [todayClasses, setTodayClasses] = useState(null);
  const [dueCount, setDueCount] = useState(0);

  useEffect(() => {
    const run = async () => {
      const { data } = await client.get("/api/batches/my/");
      const batches = data.results;

      // প্রতি batch-এর exam + schedule সমান্তরালে আনো
      const [examArrays, schedArrays] = await Promise.all([
        Promise.all(
          batches.map((b) =>
            client
              .get(`/api/batches/${b.id}/posts/?type=EXAM`)
              .then((r) =>
                r.data.results.map((p) => ({ ...p, batchName: b.name, batchId: b.id }))
              )
              .catch(() => [])
          )
        ),
        Promise.all(
          batches.map((b) =>
            client
              .get(`/api/batches/${b.id}/schedules/`)
              .then((r) =>
                r.data.results.map((s) => ({ ...s, batchName: b.name }))
              )
              .catch(() => [])
          )
        ),
      ]);

      const now = new Date();
      setExams(
        examArrays
          .flat()
          .filter((p) => p.event_date && new Date(p.event_date) > now)
          .sort((a, b) => new Date(a.event_date) - new Date(b.event_date))
          .slice(0, 5)
      );
      setTodayClasses(
        schedArrays.flat().filter((s) => s.weekday === todayPy)
      );
    };
    run();

    client.get("/api/payments/my/").then((res) => {
      const all = Object.values(res.data).flat();
      setDueCount(all.filter((r) => r.status === "DUE").length);
    });
  }, []);

  return (
    <AppShell title="Dashboard">
      <div className="space-y-4">
        <p className="text-sm text-ink-600">
          স্বাগতম, {user?.first_name || "শিক্ষার্থী"} 👋
        </p>

        {/* বকেয়া থাকলে — শুধু তখনই */}
        {dueCount > 0 && (
          <Card className="border-warn">
            <p className="text-sm">
              ৳ আপনার <span className="font-semibold">{dueCount} মাসের</span>{" "}
              বেতন বাকি —{" "}
              <Link
                to="/student/payments"
                className="text-brand-600 hover:underline font-medium"
              >
                বিস্তারিত দেখুন
              </Link>
            </p>
          </Card>
        )}

        {/* আজকের ক্লাস */}
        <div>
          <h2 className="text-sm font-semibold mb-3">আজকের ক্লাস</h2>
          {todayClasses === null ? (
            <p className="text-sm text-ink-400">লোড হচ্ছে…</p>
          ) : todayClasses.length === 0 ? (
            <Card>
              <p className="text-sm text-ink-400 text-center py-2">
                আজ কোনো ক্লাস নেই 🎉
              </p>
            </Card>
          ) : (
            <div className="space-y-2">
              {todayClasses.map((s) => (
                <Card key={s.id}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{s.batchName}</p>
                      <p className="text-xs text-ink-600">
                        {s.start_time.slice(0, 5)} – {s.end_time.slice(0, 5)}
                        {s.location && ` · ${s.location}`}
                      </p>
                    </div>
                    <span className="text-lg">🕕</span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* আসন্ন পরীক্ষা */}
        <div>
          <h2 className="text-sm font-semibold mb-3">আসন্ন পরীক্ষা</h2>
          {exams === null ? (
            <p className="text-sm text-ink-400">লোড হচ্ছে…</p>
          ) : exams.length === 0 ? (
            <Card>
              <p className="text-sm text-ink-400 text-center py-2">
                সামনে কোনো পরীক্ষা নেই
              </p>
            </Card>
          ) : (
            <div className="space-y-2">
              {exams.map((p) => (
                <Link key={p.id} to={`/student/batches/${p.batchId}`}>
                  <Card className="hover:border-brand-500 transition-colors">
                    <p className="text-sm font-medium">📝 {p.title}</p>
                    <p className="mt-0.5 text-xs text-warn font-medium">
                      {formatDateTime(p.event_date)}
                    </p>
                    <p className="mt-0.5 text-xs text-ink-400">{p.batchName}</p>
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