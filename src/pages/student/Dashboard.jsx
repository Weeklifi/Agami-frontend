import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Clock, FileText, Wallet, ChevronRight } from "lucide-react";
import client from "../../api/client";
import AppShell from "../../components/AppShell";
import Card from "../../components/ui/Card";
import IconTile from "../../components/ui/IconTile";
import { List, ListRow } from "../../components/ui/List";
import Badge from "../../components/ui/Badge";
import { useAuth } from "../../context/AuthContext";
import { formatDateTime } from "../../lib/postTypes";

// JS getDay(): রবি=0..শনি=6 → Python weekday: সোম=0..রবি=6
const todayPy = (new Date().getDay() + 6) % 7;

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [exams, setExams] = useState(null);
  const [todayClasses, setTodayClasses] = useState(null);
  const [dueCount, setDueCount] = useState(0);

  useEffect(() => {
    const run = async () => {
      const { data } = await client.get("/api/batches/my/");
      const batches = data.results;

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
          <Link to="/student/payments" className="block">
            <Card className="flex items-center gap-3 border-warn/40">
              <IconTile icon={Wallet} tone="rose" />
              <p className="flex-1 text-sm">
                আপনার <span className="font-semibold">{dueCount} মাসের</span> বেতন বাকি
              </p>
              <ChevronRight className="h-5 w-5 text-ink-400" />
            </Card>
          </Link>
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
            <List>
              {todayClasses.map((s) => (
                <ListRow
                  key={s.id}
                  left={<IconTile icon={Clock} tone="indigo" />}
                  title={s.batchName}
                  desc={`${s.start_time.slice(0, 5)} – ${s.end_time.slice(0, 5)}${
                    s.location ? ` · ${s.location}` : ""
                  }`}
                  right={<Badge tone="emerald">আজ</Badge>}
                />
              ))}
            </List>
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
            <List>
              {exams.map((p) => (
                <ListRow
                  key={p.id}
                  onClick={() => navigate(`/student/batches/${p.batchId}`)}
                  left={<IconTile icon={FileText} tone="amber" />}
                  title={p.title}
                  desc={p.batchName}
                  right={
                    <span className="text-xs font-medium text-warn whitespace-nowrap">
                      {formatDateTime(p.event_date)}
                    </span>
                  }
                />
              ))}
            </List>
          )}
        </div>
      </div>
    </AppShell>
  );
}
