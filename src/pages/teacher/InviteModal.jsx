import { useState } from "react";
import client from "../../api/client";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";

export default function InviteModal({ open, onClose, batchId }) {
  const [raw, setRaw] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    // কমা/নতুন লাইন/স্পেস — যেভাবেই লিখুক, ভেঙে নাও
    const emails = raw
      .split(/[\s,;]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (emails.length === 0) {
      setError("অন্তত একটি email দিন।");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { data } = await client.post(`/api/batches/${batchId}/invite/`, {
        emails,
      });
      setResult(data);
      setRaw("");
    } catch (err) {
      setError(
        err.response?.data?.emails?.[0] || "পাঠানো যায়নি — আবার চেষ্টা করুন।"
      );
    } finally {
      setLoading(false);
    }
  };

  const close = () => {
    setResult(null);
    setError("");
    onClose();
  };

  return (
    <Modal open={open} onClose={close} title="Email Invitation">
      {result ? (
        <div className="space-y-3">
          {result.sent.length > 0 && (
            <div className="rounded-lg bg-emerald-50 p-3 text-sm text-ok">
              ✓ পাঠানো হয়েছে: {result.sent.join(", ")}
            </div>
          )}
          {result.skipped.length > 0 && (
            <div className="rounded-lg bg-amber-50 p-3 text-sm text-warn">
              {result.skipped.map((s) => (
                <p key={s.email}>
                  ⚠ {s.email} — {s.reason}
                </p>
              ))}
            </div>
          )}
          <Button variant="secondary" onClick={close}>
            ঠিক আছে
          </Button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">
              শিক্ষার্থীদের Email
            </label>
            <textarea
              rows={4}
              placeholder={"rahim@example.com\nkarim@example.com"}
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              className="w-full rounded-lg border border-line bg-surface px-3.5
                py-2.5 text-sm placeholder:text-ink-400 outline-none
                focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
            <p className="text-xs text-ink-400">
              একাধিক email কমা বা নতুন লাইনে আলাদা করুন
            </p>
          </div>
          {error && <p className="text-sm text-err">{error}</p>}
          <Button type="submit" loading={loading}>
            Invitation পাঠান
          </Button>
        </form>
      )}
    </Modal>
  );
}