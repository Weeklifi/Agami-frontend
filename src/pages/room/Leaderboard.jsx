import { useCallback, useEffect, useState } from "react";
import client from "../../api/client";
import Avatar from "../../components/ui/Avatar";

const medal = (rank) => {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return null;
};

export default function Leaderboard({ exam, isTeacher, onBack }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    client
      .get(`/api/results/exams/${exam.id}/leaderboard/`)
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.detail || "লোড করা যায়নি।"));
  }, [exam.id]);

  useEffect(load, [load]);

  if (error)
    return (
      <div className="space-y-3">
        <button onClick={onBack} className="text-xs text-brand-600 hover:underline">
          ‹ ফিরে যান
        </button>
        <p className="text-sm text-ink-400 text-center py-6">{error}</p>
      </div>
    );

  if (data === null) return <p className="text-sm text-ink-400">লোড হচ্ছে…</p>;

  const rows = isTeacher ? data.ranking : data.leaderboard;

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="text-xs text-brand-600 hover:underline">
        ‹ পরীক্ষার তালিকায় ফিরুন
      </button>

      <div>
        <h3 className="text-sm font-bold">{data.exam.name}</h3>
        <p className="text-xs text-ink-400">
          পূর্ণমান {data.exam.total_marks}
          {!isTeacher && ` · ${data.total_students} জন অংশ নিয়েছে`}
        </p>
      </div>

      {/* Student-এর নিজের ফলাফল */}
      {!isTeacher && data.my_result && (
        <div className="rounded-lg bg-brand-50 p-4 text-center">
          {data.my_result.is_absent ? (
            <p className="text-sm text-err font-medium">
              আপনি এই পরীক্ষায় অনুপস্থিত ছিলেন
            </p>
          ) : data.my_result.marks === null ? (
            <p className="text-sm text-ink-600">আপনার নম্বর এখনো দেওয়া হয়নি</p>
          ) : (
            <>
              <p className="text-xs text-ink-600 mb-1">আপনার নম্বর</p>
              <p className="text-3xl font-bold text-brand-700">
                {data.my_result.marks}
                <span className="text-base font-normal text-ink-400">
                  /{data.exam.total_marks}
                </span>
              </p>
              <p className="text-sm text-ink-600 mt-1">
                {data.my_result.percentage}% · অবস্থান{" "}
                <strong>{data.my_result.rank}</strong> / {data.total_students}
              </p>
            </>
          )}
        </div>
      )}

      {/* Leaderboard */}
      {!isTeacher && !data.show_leaderboard ? (
        <p className="text-xs text-ink-400 text-center py-4">
          এই পরীক্ষার leaderboard প্রকাশ করা হয়নি।
        </p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-ink-400 text-center py-6">
          এখনো কারো নম্বর দেওয়া হয়নি।
        </p>
      ) : (
        <>
          <p className="text-xs font-semibold text-ink-600">
            🏆 {isTeacher ? "সম্পূর্ণ র‍্যাঙ্কিং" : `শীর্ষ ${rows.length} জন`}
          </p>
          <ul className="space-y-1.5">
            {rows.map((r) => (
              <li
                key={r.student_id}
                className={`flex items-center gap-3 rounded-lg p-2.5
                  ${r.rank <= 3 ? "bg-amber-50" : "bg-page"}`}
              >
                <span className="w-7 text-center text-sm font-bold shrink-0">
                  {medal(r.rank) || r.rank}
                </span>
                <Avatar name={r.student_name} size="sm" />
                <p className="flex-1 min-w-0 text-sm font-medium truncate">
                  {r.student_name}
                </p>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold">{r.marks}</p>
                  <p className="text-[11px] text-ink-400">{r.percentage}%</p>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}