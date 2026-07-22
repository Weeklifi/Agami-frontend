import { useCallback, useEffect, useState } from "react";
import client from "../../api/client";

const monthStr = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

export default function AttendanceStudent({ batchId }) {
  const [month, setMonth] = useState(new Date());
  const [data, setData] = useState(null);

  const load = useCallback(() => {
    setData(null);
    client
      .get(`/api/attendance/my/?batch=${batchId}&month=${monthStr(month)}`)
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
          {/* বড় করে শতাংশ */}
          <div className="text-center py-4">
            <p className={`text-4xl font-bold ${tone(data.percentage)}`}>
              {data.percentage}%
            </p>
            <p className="text-xs text-ink-600 mt-1">উপস্থিতির হার</p>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg bg-emerald-50 py-2">
              <p className="text-lg font-semibold text-ok">{data.present}</p>
              <p className="text-xs text-ink-600">উপস্থিত</p>
            </div>
            <div className="rounded-lg bg-red-50 py-2">
              <p className="text-lg font-semibold text-err">{data.absent}</p>
              <p className="text-xs text-ink-600">অনুপস্থিত</p>
            </div>
            <div className="rounded-lg bg-page py-2">
              <p className="text-lg font-semibold">{data.total_classes}</p>
              <p className="text-xs text-ink-600">মোট ক্লাস</p>
            </div>
          </div>

          {/* দিনভিত্তিক তালিকা */}
          {data.days.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-ink-600 mb-2">
                দিনভিত্তিক
              </p>
              <ul className="divide-y divide-line">
                {data.days.map((d) => (
                  <li
                    key={d.date}
                    className="flex items-center justify-between py-2"
                  >
                    <span className="text-sm">
                      {new Date(d.date).toLocaleDateString("bn-BD", {
                        day: "numeric",
                        month: "short",
                        weekday: "short",
                      })}
                    </span>
                    <span
                      className={`text-sm font-medium ${
                        d.status === "PRESENT" ? "text-ok" : "text-err"
                      }`}
                    >
                      {d.status === "PRESENT" ? "✓ উপস্থিত" : "✗ অনুপস্থিত"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}