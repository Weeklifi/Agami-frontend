import { useCallback, useEffect, useState } from "react";
import client from "../../api/client";
import Button from "../../components/ui/Button";

const todayStr = () => new Date().toISOString().slice(0, 10);

export default function AttendanceSheet({ batchId }) {
  const [date, setDate] = useState(todayStr());
  const [sheet, setSheet] = useState(null);
  const [busy, setBusy] = useState(null); // কোন record-এ কাজ চলছে

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

  // সবাইকে একসাথে present — সাধারণত বেশিরভাগ উপস্থিত থাকে,
  // তাই এটা চেপে শুধু অনুপস্থিতদের বদলানো দ্রুত
  const markAllPresent = async () => {
    const unmarked = sheet.records.filter((r) => r.status === "UNMARKED");
    setBusy("all");
    try {
      await Promise.all(
        unmarked.map((r) =>
          client.post(`/api/attendance/records/${r.id}/mark/`, {
            status: "PRESENT",
          })
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

  if (sheet === null)
    return <p className="text-sm text-ink-400">লোড হচ্ছে…</p>;

  const s = sheet.summary;

  return (
    <div className="space-y-4">
      {/* তারিখ নির্বাচন */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => shiftDay(-1)}
          className="px-2 py-1 hover:bg-page rounded"
        >
          ‹
        </button>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-lg border border-line px-3 py-1.5 text-sm
            outline-none focus:border-brand-500"
        />
        <button
          onClick={() => shiftDay(1)}
          className="px-2 py-1 hover:bg-page rounded"
        >
          ›
        </button>
      </div>

      {/* Summary */}
      {s && (
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="rounded-lg bg-emerald-50 py-2">
            <p className="text-lg font-semibold text-ok">{s.present}</p>
            <p className="text-xs text-ink-600">উপস্থিত</p>
          </div>
          <div className="rounded-lg bg-red-50 py-2">
            <p className="text-lg font-semibold text-err">{s.absent}</p>
            <p className="text-xs text-ink-600">অনুপস্থিত</p>
          </div>
          <div className="rounded-lg bg-amber-50 py-2">
            <p className="text-lg font-semibold text-warn">{s.unmarked}</p>
            <p className="text-xs text-ink-600">বাকি</p>
          </div>
          <div className="rounded-lg bg-page py-2">
            <p className="text-lg font-semibold">{s.total}</p>
            <p className="text-xs text-ink-600">মোট</p>
          </div>
        </div>
      )}

      {/* সবাইকে present */}
      {s?.unmarked > 0 && (
        <Button
          variant="secondary"
          className="text-xs"
          loading={busy === "all"}
          onClick={markAllPresent}
        >
          ✓ বাকি {s.unmarked} জনকে উপস্থিত ধরুন
        </Button>
      )}

      {/* Student list */}
      {sheet.records.length === 0 ? (
        <p className="text-sm text-ink-400 text-center py-6">
          এই batch-এ কোনো শিক্ষার্থী নেই।
        </p>
      ) : (
        <ul className="divide-y divide-line">
          {sheet.records.map((r) => (
            <li
              key={r.id}
              className="flex items-center justify-between gap-3 py-2.5"
            >
              <p className="text-sm font-medium min-w-0 truncate">
                {r.student_name}
              </p>
              <div className="flex gap-1.5 shrink-0">
                <button
                  onClick={() => mark(r.id, "PRESENT")}
                  disabled={busy === r.id}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium border
                    transition-colors
                    ${
                      r.status === "PRESENT"
                        ? "bg-ok text-white border-ok"
                        : "border-line text-ink-600 hover:border-ok hover:text-ok"
                    }`}
                >
                  ✓ উপস্থিত
                </button>
                <button
                  onClick={() => mark(r.id, "ABSENT")}
                  disabled={busy === r.id}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium border
                    transition-colors
                    ${
                      r.status === "ABSENT"
                        ? "bg-err text-white border-err"
                        : "border-line text-ink-600 hover:border-err hover:text-err"
                    }`}
                >
                  ✗ অনুপস্থিত
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}