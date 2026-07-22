import { useCallback, useEffect, useState } from "react";
import client from "../../api/client";

const monthStr = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

export default function AttendanceReport({ batchId }) {
  const [month, setMonth] = useState(new Date());
  const [data, setData] = useState(null);

  const load = useCallback(() => {
    setData(null);
    client
      .get(`/api/batches/${batchId}/attendance/monthly/?month=${monthStr(month)}`)
      .then((res) => setData(res.data));
  }, [batchId, month]);

  useEffect(load, [load]);

  const shiftMonth = (delta) => {
    const d = new Date(month);
    d.setMonth(d.getMonth() + delta);
    setMonth(d);
  };

  const tone = (pct) => {
    if (pct >= 80) return "text-ok";
    if (pct >= 60) return "text-warn";
    return "text-err";
  };

  return (
    <div className="space-y-4">
      {/* মাস নির্বাচন */}
      <div className="flex items-center justify-between">
        <button onClick={() => shiftMonth(-1)} className="px-2 py-1 hover:bg-page rounded">‹</button>
        <span className="text-sm font-medium">
          {month.toLocaleString("bn-BD", { month: "long", year: "numeric" })}
        </span>
        <button onClick={() => shiftMonth(1)} className="px-2 py-1 hover:bg-page rounded">›</button>
      </div>

      {data === null ? (
        <p className="text-sm text-ink-400">লোড হচ্ছে…</p>
      ) : data.total_classes === 0 ? (
        <p className="text-sm text-ink-400 text-center py-6">
          এই মাসে কোনো ক্লাসের হাজিরা নেওয়া হয়নি।
        </p>
      ) : (
        <>
          <p className="text-xs text-ink-600 text-center">
            এই মাসে মোট <strong>{data.total_classes}</strong>টি ক্লাস
          </p>

          <ul className="divide-y divide-line">
            {data.students.map((st) => (
              <li
                key={st.student_name}
                className="flex items-center justify-between gap-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">
                    {st.student_name}
                  </p>
                  <p className="text-xs text-ink-400">
                    ✓ {st.present} · ✗ {st.absent}
                    {st.unmarked > 0 && ` · বাকি ${st.unmarked}`}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className={`text-lg font-bold ${tone(st.percentage)}`}>
                    {st.percentage}%
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}