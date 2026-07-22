import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import client from "../../api/client";
import AppShell from "../../components/AppShell";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

const SMS_LENGTH = 160;

export default function BulkSms() {
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);
  const [batchId, setBatchId] = useState("");
  const [info, setInfo] = useState(null); // {total_students, with_phone, balance}
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const textareaRef = useRef(null);

  // Batches load
  useEffect(() => {
    client.get("/api/batches/").then((res) => {
      const list = res.data.results || res.data;
      setBatches(list);
      if (list.length) setBatchId(list[0].id);
    });
  }, []);

  // Batch বদলালে recipient info + balance
  useEffect(() => {
    if (!batchId) return;
    client.get(`/api/batches/${batchId}/sms-info/`).then((res) => setInfo(res.data));
  }, [batchId]);

  // SMS part হিসাব
  const smsParts = Math.max(1, Math.ceil(message.length / SMS_LENGTH));
  const recipientCount = info?.with_phone || 0;
  const totalSmsNeeded = recipientCount * smsParts;
  const balance = info?.balance || 0;
  const enough = balance >= totalSmsNeeded && recipientCount > 0;

  // [Student_Name] tag cursor-এ বসানো
  const insertTag = () => {
    const el = textareaRef.current;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const next = message.slice(0, start) + "[Student_Name]" + message.slice(end);
    setMessage(next);
    // cursor tag-এর পরে নিয়ে যাও
    setTimeout(() => {
      el.focus();
      const pos = start + "[Student_Name]".length;
      el.setSelectionRange(pos, pos);
    }, 0);
  };

  const send = async () => {
    setBusy(true);
    setError("");
    setResult(null);
    try {
      const { data } = await client.post("/api/sms/send-batch/", {
        batchId,
        messageTemplate: message,
      });
      setResult(data);
      setMessage("");
      // balance refresh
      client.get(`/api/batches/${batchId}/sms-info/`).then((res) => setInfo(res.data));
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.detail || "পাঠানো যায়নি।");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppShell title="Bulk SMS">
      <div className="max-w-2xl space-y-4">
        {/* Balance card */}
        <Card className="flex items-center justify-between">
          <div>
            <p className="text-xs text-ink-400">SMS ব্যালেন্স</p>
            <p className="text-2xl font-bold">{balance}</p>
          </div>
          <Button
            variant="secondary"
            className="!w-auto"
            onClick={() => navigate("/teacher/sms/recharge")}
          >
            💳 Recharge
          </Button>
        </Card>

        <Card className="space-y-4">
          {/* Batch dropdown */}
          <div>
            <label className="text-sm font-medium block mb-1.5">Batch নির্বাচন</label>
            <select
              value={batchId}
              onChange={(e) => setBatchId(e.target.value)}
              className="w-full rounded-lg border border-line px-3.5 py-2.5 text-sm
                outline-none focus:border-brand-500"
            >
              {batches.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* Message */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium">বার্তা</label>
              <button
                type="button"
                onClick={insertTag}
                className="text-xs text-brand-600 hover:underline"
              >
                + [Student_Name] যোগ করুন
              </button>
            </div>
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="যেমন: প্রিয় [Student_Name], আগামীকাল ক্লাস বন্ধ থাকবে।"
              className="w-full rounded-lg border border-line px-3.5 py-2.5 text-sm
                outline-none focus:border-brand-500 resize-none"
            />
            <div className="flex items-center justify-between mt-1 text-xs text-ink-400">
              <span>{message.length} অক্ষর</span>
              <span>{smsParts} SMS/জন</span>
            </div>
          </div>

          {/* হিসাব */}
          {info && (
            <div className="rounded-lg bg-page p-3 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-ink-600">Batch-এ শিক্ষার্থী</span>
                <span className="font-medium">{info.total_students} জন</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-600">ফোন নম্বর আছে</span>
                <span className="font-medium">{recipientCount} জন</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-600">মোট SMS দরকার</span>
                <span className="font-medium">{totalSmsNeeded}টি</span>
              </div>
              <div className="flex justify-between border-t border-line pt-1 mt-1">
                <span className="text-ink-600">আপনার ব্যালেন্স</span>
                <span className={`font-bold ${enough ? "text-ok" : "text-err"}`}>
                  {balance}টি
                </span>
              </div>
            </div>
          )}

          {recipientCount === 0 && info && (
            <p className="text-xs text-warn">
              ⚠️ এই batch-এ কারো ফোন নম্বর যোগ করা নেই। Student list-এ গিয়ে যোগ করুন।
            </p>
          )}

          {error && <p className="text-sm text-err">{error}</p>}

          {result && (
            <div className="rounded-lg bg-emerald-50 p-3 text-sm text-ok">
              ✓ {result.sent}/{result.total} জনকে পাঠানো হয়েছে।
              {result.failed > 0 && ` (${result.failed}টি ব্যর্থ, credit ফেরত দেওয়া হয়েছে)`}
            </div>
          )}

          {/* Send / Recharge */}
          {enough ? (
            <Button loading={busy} disabled={!message.trim()} onClick={send}>
              📤 {totalSmsNeeded}টি SMS পাঠান
            </Button>
          ) : (
            <div className="space-y-2">
              {recipientCount > 0 && (
                <p className="text-xs text-err text-center">
                  ব্যালেন্স যথেষ্ট নয় — আরও {totalSmsNeeded - balance}টি SMS দরকার
                </p>
              )}
              <Button onClick={() => navigate("/teacher/sms/recharge")}>
                💳 SMS Recharge করুন
              </Button>
            </div>
          )}
        </Card>
      </div>
    </AppShell>
  );
}