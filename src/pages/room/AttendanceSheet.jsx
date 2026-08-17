import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Check, X } from "lucide-react";
import client from "../../api/client";
import Button from "../../components/ui/Button";
import Avatar from "../../components/ui/Avatar";
import StatTile from "../../components/ui/StatTile";

const todayStr = () => new Date().toISOString().slice(0, 10);

export default function AttendanceSheet({ batchId }) {
  const [date, setDate] = useState(todayStr());
  const [sheet, setSheet] = useState(null);
  const [busy, setBusy] = useState(null);

  const load = useCallback(() => {
    setSheet(null);
    client
      .get(`/api/batches/${batchId}/attendance/?date=${date}`)
      .then((res) => setSheet(res.data))
      .catch(() => setSheet({ records: [], summary: null }));
  }, [batchId, date]);

  useEffect(load, [load]);

  const mark = async (recordId, status) => {
    setBusy(recordId);
    try {
      await client.post(`/api/attendance/records/${recordId}/mark/`, { status });
      load();
    } finally {
      setBusy(null);
    }
  };

  const markAllPresent = async () => {
    const unmarked = sheet.records.filter((r) => r.status === "UNMARKED");
    setBusy("all");
    try {
      await Promise.all(
        unmarked.map((r) =>
          client.post(`/api/attendance/records/${r.id}/mark/`, { status: "PRESENT" })
        )
      );
      load();
    } finally {
      setBusy(null);
    }
  };

  const shiftDay = (delta) => {
    const d = new Date(date);
    d.setDate(d.getDate() + delta);
    setDate(d.toISOString().slice(0, 10));
  };

  if (sheet === null) return <p className="text-sm text-ink-400">লোড হচ্ছে…</p>;

  const s = sheet.summary;

  return (
    <div className="space-y-4">
      {/* তারিখ নির্বাচন */}
      <div className="flex items-center justify-between">
        <button onClick={() => shiftDay(-1)}
          className="grid h-9 w-9 place-items-center rounded-lg hover:bg-page">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-xl border border-line px-3 py-2 text-sm
            outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        />
        <button onClick={() => shiftDay(1)}
          className="grid h-9 w-9 place-items-center rounded-lg hover:bg-page">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Summary */}
      {s && (
        <div className="grid grid-cols-4 gap-2">
          <StatTile value={s.present} label="উপস্থিত" tone="ok" />
          <StatTile value={s.absent} label="অনুপস্থিত" tone="err" />
          <StatTile value={s.unmarked} label="বাকি" tone="warn" />
          <StatTile value={s.total} label="মোট" />
        </div>
      )}

      {/* সবাইকে present */}
      {s?.unmarked > 0 && (
        <Button variant="secondary" className="text-xs" loading={busy === "all"}
          onClick={markAllPresent}>
          <Check className="h-4 w-4" /> বাকি {s.unmarked} জনকে উপস্থিত ধরুন
        </Button>
      )}

      {/* Student list */}
      {sheet.records.length === 0 ? (
        <p className="text-sm text-ink-400 text-center py-6">
          এই batch-এ কোনো শিক্ষার্থী নেই।
        </p>
      ) : (
        <ul className="rounded-2xl border border-line bg-surface shadow-soft
          divide-y divide-line overflow-hidden">
          {sheet.records.map((r) => (
            <li key={r.id} className="flex items-center gap-2.5 px-3 py-2.5">
              <Avatar name={r.student_name} size="sm" />
              <p className="flex-1 min-w-0 text-sm font-semibold truncate">
                {r.student_name}
              </p>
              <div className="flex gap-1.5 shrink-0">
                <button
                  onClick={() => mark(r.id, "PRESENT")}
                  disabled={busy === r.id}
                  className={`grid h-8 w-8 place-items-center rounded-lg border transition-colors
                    ${r.status === "PRESENT"
                      ? "bg-ok text-white border-ok"
                      : "border-line text-ink-400 hover:border-ok hover:text-ok"
                    }`}
                  title="উপস্থিত"
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  onClick={() => mark(r.id, "ABSENT")}
                  disabled={busy === r.id}
                  className={`grid h-8 w-8 place-items-center rounded-lg border transition-colors
                    ${r.status === "ABSENT"
                      ? "bg-err text-white border-err"
                      : "border-line text-ink-400 hover:border-err hover:text-err"
                    }`}
                  title="অনুপস্থিত"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
