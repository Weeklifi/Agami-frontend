import { useCallback, useEffect, useState } from "react";
import client from "../../api/client";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Badge from "../../components/ui/Badge";

const today = () => new Date().toISOString().slice(0, 10);

export default function ExamList({ batchId, isTeacher, onOpenSheet, onOpenBoard }) {
  const [exams, setExams] = useState(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    name: "",
    exam_date: today(),
    total_marks: "",
    leaderboard_size: 5,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    client
      .get(`/api/batches/${batchId}/exams/`)
      .then((res) => setExams(res.data.results || res.data));
  }, [batchId]);

  useEffect(load, [load]);

  const create = async () => {
    if (!form.name.trim() || !form.total_marks) {
      setError("নাম ও পূর্ণমান দিন।");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await client.post(`/api/batches/${batchId}/exams/`, form);
      setForm({ name: "", exam_date: today(), total_marks: "", leaderboard_size: 5 });
      setCreating(false);
      load();
    } catch (err) {
      setError(err.response?.data?.detail || "তৈরি করা যায়নি।");
    } finally {
      setBusy(false);
    }
  };

  const togglePublish = async (exam) => {
    await client.patch(`/api/batches/${batchId}/exams/${exam.id}/`, {
      is_published: !exam.is_published,
    });
    load();
  };

  if (exams === null) return <p className="text-sm text-ink-400">লোড হচ্ছে…</p>;

  return (
    <div className="space-y-4">
      {isTeacher &&
        (creating ? (
          <div className="space-y-2.5 rounded-lg bg-page p-3">
            <Input
              placeholder="পরীক্ষার নাম — যেমন Chemistry Ch.3"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="date"
                value={form.exam_date}
                onChange={(e) => setForm({ ...form, exam_date: e.target.value })}
              />
              <Input
                type="number"
                placeholder="পূর্ণমান"
                value={form.total_marks}
                onChange={(e) => setForm({ ...form, total_marks: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs text-ink-600 block mb-1">
                Leaderboard-এ কতজন দেখাবে
              </label>
              <select
                value={form.leaderboard_size}
                onChange={(e) =>
                  setForm({ ...form, leaderboard_size: Number(e.target.value) })
                }
                className="w-full rounded-lg border border-line px-3 py-2 text-sm
                  outline-none focus:border-brand-500"
              >
                {[3, 5, 10, 20].map((n) => (
                  <option key={n} value={n}>Top {n}</option>
                ))}
              </select>
            </div>
            {error && <p className="text-xs text-err">{error}</p>}
            <div className="flex gap-2">
              <Button className="!w-auto text-xs px-4" loading={busy} onClick={create}>
                তৈরি করুন
              </Button>
              <Button
                variant="secondary"
                className="!w-auto text-xs px-4"
                onClick={() => setCreating(false)}
              >
                বাতিল
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="secondary"
            className="text-xs"
            onClick={() => setCreating(true)}
          >
            + নতুন পরীক্ষা
          </Button>
        ))}

      {exams.length === 0 ? (
        <p className="text-sm text-ink-400 text-center py-6">
          এখনো কোনো পরীক্ষা নেই।
        </p>
      ) : (
        <ul className="divide-y divide-line">
          {exams.map((ex) => (
            <li key={ex.id} className="py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{ex.name}</p>
                  <p className="text-xs text-ink-400 mt-0.5">
                    {new Date(ex.exam_date).toLocaleDateString("bn-BD", {
                      day: "numeric",
                      month: "long",
                    })}{" "}
                    · পূর্ণমান {ex.total_marks}
                    {isTeacher && ` · ${ex.result_count} জনের নম্বর দেওয়া`}
                  </p>
                </div>
                {isTeacher && (
                  <Badge tone={ex.is_published ? "ok" : "neutral"}>
                    {ex.is_published ? "প্রকাশিত" : "খসড়া"}
                  </Badge>
                )}
              </div>

              <div className="mt-2 flex gap-2 flex-wrap">
                {isTeacher && (
                  <>
                    <Button
                      variant="secondary"
                      className="!w-auto text-xs px-3 py-1.5"
                      onClick={() => onOpenSheet(ex)}
                    >
                      নম্বর দিন
                    </Button>
                    <Button
                      variant="secondary"
                      className="!w-auto text-xs px-3 py-1.5"
                      onClick={() => togglePublish(ex)}
                    >
                      {ex.is_published ? "অপ্রকাশ করুন" : "প্রকাশ করুন"}
                    </Button>
                  </>
                )}
                <Button
                  className="!w-auto text-xs px-3 py-1.5"
                  onClick={() => onOpenBoard(ex)}
                >
                  🏆 Leaderboard
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}