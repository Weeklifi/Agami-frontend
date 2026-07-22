import { useCallback, useEffect, useState } from "react";
import client from "../../api/client";

export default function ExamSheet({ exam, onBack }) {
  const [data, setData] = useState(null);
  const [drafts, setDrafts] = useState({});
  const [busy, setBusy] = useState(null);

  const load = useCallback(() => {
    client.get(`/api/results/exams/${exam.id}/sheet/`).then((res) => {
      setData(res.data);
      const d = {};
      res.data.results.forEach((r) => {
        d[r.id] = r.marks !== null ? String(r.marks) : "";
      });
      setDrafts(d);
    });
  }, [exam.id]);

  useEffect(load, [load]);

  const save = async (resultId, isAbsent = false) => {
    setBusy(resultId);
    try {
      await client.post(`/api/results/records/${resultId}/mark/`, {
        marks: isAbsent ? null : drafts[resultId] || null,
        is_absent: isAbsent,
      });
      load();
    } catch (err) {
      alert(err.response?.data?.detail || "সংরক্ষণ করা যায়নি।");
    } finally {
      setBusy(null);
    }
  };

  if (data === null) return <p className="text-sm text-ink-400">লোড হচ্ছে…</p>;

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="text-xs text-brand-600 hover:underline">
        ‹ পরীক্ষার তালিকায় ফিরুন
      </button>

      <div>
        <h3 className="text-sm font-bold">{exam.name}</h3>
        <p className="text-xs text-ink-400">পূর্ণমান {exam.total_marks}</p>
      </div>

      <ul className="divide-y divide-line">
        {data.results.map((r) => (
          <li key={r.id} className="flex items-center gap-2 py-2.5">
            <p className="flex-1 min-w-0 text-sm font-medium truncate">
              {r.student_name}
            </p>

            {r.is_absent ? (
              <span className="text-xs text-err font-medium px-2">অনুপস্থিত</span>
            ) : (
              <input
                type="number"
                value={drafts[r.id] ?? ""}
                onChange={(e) => setDrafts({ ...drafts, [r.id]: e.target.value })}
                onBlur={() => {
                  const orig = r.marks !== null ? String(r.marks) : "";
                  if (drafts[r.id] !== orig) save(r.id);
                }}
                placeholder="—"
                className="w-16 rounded-lg border border-line px-2 py-1.5 text-sm
                  text-center outline-none focus:border-brand-500"
              />
            )}

            {r.percentage !== null && !r.is_absent && (
              <span className="text-xs text-ink-400 w-12 text-right">
                {r.percentage}%
              </span>
            )}

            <button
              onClick={() => save(r.id, !r.is_absent)}
              disabled={busy === r.id}
              className={`text-xs px-2 py-1 rounded border shrink-0
                ${
                  r.is_absent
                    ? "border-err text-err"
                    : "border-line text-ink-400 hover:border-err hover:text-err"
                }`}
              title="অনুপস্থিত হিসেবে চিহ্নিত করুন"
            >
              ✗
            </button>
          </li>
        ))}
      </ul>

      <p className="text-xs text-ink-400 text-center">
        নম্বর লিখে অন্য জায়গায় ক্লিক করলেই সংরক্ষিত হবে
      </p>
    </div>
  );
}