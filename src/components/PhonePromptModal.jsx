import { useState } from "react";
import client from "../api/client";
import Button from "./ui/Button";

export default function PhonePromptModal({ batchId, batchName, onDone }) {
  const [form, setForm] = useState({
    student_phone: "",
    guardian_phone: "",
    guardian_name: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async () => {
    if (!form.student_phone.trim() || !form.guardian_phone.trim()) {
      setError("নিজের ও অভিভাবকের ফোন নম্বর দুটোই দিন।");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await client.post(`/api/batches/${batchId}/my-phone/`, form);
      onDone();
    } catch (err) {
      setError(err.response?.data?.detail || "সংরক্ষণ করা যায়নি।");
    } finally {
      setBusy(false);
    }
  };

  // এটা বন্ধ করা যাবে না — phone না দিলে Room দেখা যাবে না
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink-900/50" />
      <div className="relative w-full max-w-md rounded-2xl bg-surface p-6 shadow-xl">
        <div className="text-center mb-5">
          <div className="text-3xl mb-2">📱</div>
          <h2 className="text-lg font-bold">ফোন নম্বর দিন</h2>
          <p className="mt-1 text-sm text-ink-600">
            "{batchName}"-এ যুক্ত হতে আপনার ও অভিভাবকের ফোন নম্বর প্রয়োজন।
            শিক্ষক জরুরি বার্তা পাঠাতে পারবেন।
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-ink-600 block mb-1">আপনার ফোন নম্বর *</label>
            <input
              value={form.student_phone}
              onChange={set("student_phone")}
              placeholder="01XXXXXXXXX"
              className="w-full rounded-lg border border-line px-3.5 py-2.5 text-sm
                outline-none focus:border-brand-500"
            />
          </div>
          <div>
            <label className="text-xs text-ink-600 block mb-1">অভিভাবকের নাম</label>
            <input
              value={form.guardian_name}
              onChange={set("guardian_name")}
              placeholder="ঐচ্ছিক"
              className="w-full rounded-lg border border-line px-3.5 py-2.5 text-sm
                outline-none focus:border-brand-500"
            />
          </div>
          <div>
            <label className="text-xs text-ink-600 block mb-1">অভিভাবকের ফোন নম্বর *</label>
            <input
              value={form.guardian_phone}
              onChange={set("guardian_phone")}
              placeholder="01XXXXXXXXX"
              className="w-full rounded-lg border border-line px-3.5 py-2.5 text-sm
                outline-none focus:border-brand-500"
            />
          </div>

          {error && <p className="text-xs text-err">{error}</p>}

          <Button loading={busy} onClick={submit}>
            সংরক্ষণ করে এগিয়ে যান
          </Button>
        </div>
      </div>
    </div>
  );
}