import { useEffect, useState } from "react";
import client from "../../api/client";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";

const monthStr = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

function tone(status) {
  if (status === "PAID") return "ok";
  if (status === "PENDING_VERIFICATION") return "warn";
  if (status === "WAIVED") return "neutral";
  return "err";
}

function label(status) {
  if (status === "PAID") return "✓ পরিশোধিত";
  if (status === "PENDING_VERIFICATION") return "⏳ যাচাই বাকি";
  if (status === "WAIVED") return "মাফ";
  return "বাকি";
}

export default function FeeSheetTeacher({ batchId }) {
  const [fee, setFee] = useState(undefined);
  const [feeInput, setFeeInput] = useState("");
  const [month, setMonth] = useState(new Date());
  const [data, setData] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    client.get(`/api/batches/${batchId}/fee/`).then((res) => {
      setFee(res.data.monthly_fee);
      if (res.data.monthly_fee) setFeeInput(res.data.monthly_fee);
    });
  }, [batchId]);

  const loadRecords = () => {
    setData(null);
    client
      .get(`/api/batches/${batchId}/fee-records/?month=${monthStr(month)}`)
      .then((res) => setData(res.data));
  };

  useEffect(() => {
    if (fee) loadRecords();
  }, [fee, month]); // eslint-disable-line react-hooks/exhaustive-deps

  const saveFee = async () => {
    setBusy(true);
    await client.put(`/api/batches/${batchId}/fee/`, {
      monthly_fee: feeInput,
    });
    setFee(feeInput);
    setBusy(false);
  };

  // PAID ⇄ DUE toggle (আগের মতোই — PENDING_VERIFICATION-এ এটা ব্যবহার হবে না)
  const toggle = async (record) => {
    const next = record.status === "PAID" ? "DUE" : "PAID";
    await client.post(`/api/payments/records/${record.id}/mark/`, {
      status: next,
      method: next === "PAID" ? "CASH" : "",
    });
    loadRecords();
  };

  // Student-এর জমা দেওয়া TrxID confirm করা
  const confirm = async (recordId) => {
    await client.post(`/api/payments/records/${recordId}/confirm/`);
    loadRecords();
  };

  const shiftMonth = (delta) => {
    const d = new Date(month);
    d.setMonth(d.getMonth() + delta);
    setMonth(d);
  };

  if (fee === undefined)
    return <p className="text-sm text-ink-400">লোড হচ্ছে…</p>;

  if (fee === null)
    return (
      <div className="space-y-3 text-center py-2">
        <p className="text-sm text-ink-600">
          আগে এই batch-এর মাসিক বেতন ঠিক করুন — তারপর প্রতি মাসের আদায়ের
          হিসাব এখানেই রাখতে পারবেন।
        </p>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="500"
            value={feeInput}
            onChange={(e) => setFeeInput(e.target.value)}
            className="flex-1 rounded-lg border border-line px-3.5 py-2.5
              text-sm outline-none focus:border-brand-500"
          />
          <Button className="!w-auto" onClick={saveFee} loading={busy}
            disabled={!feeInput}>
            Set করুন
          </Button>
        </div>
      </div>
    );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-600">
          মাসিক বেতন: <span className="font-semibold text-ink-900">৳{fee}</span>
        </p>
        <div className="flex items-center gap-2 text-sm">
          <button onClick={() => shiftMonth(-1)} className="px-2 py-1 hover:bg-page rounded">‹</button>
          <span className="font-medium">
            {month.toLocaleString("bn-BD", { month: "long", year: "numeric" })}
          </span>
          <button onClick={() => shiftMonth(1)} className="px-2 py-1 hover:bg-page rounded">›</button>
        </div>
      </div>

      {data === null ? (
        <p className="text-sm text-ink-400">লোড হচ্ছে…</p>
      ) : (
        <>
          {/* Summary */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg bg-emerald-50 py-2">
              <p className="text-lg font-semibold text-ok">{data.summary.paid}</p>
              <p className="text-xs text-ink-600">পরিশোধিত</p>
            </div>
            <div className="rounded-lg bg-red-50 py-2">
              <p className="text-lg font-semibold text-err">{data.summary.due}</p>
              <p className="text-xs text-ink-600">বাকি</p>
            </div>
            <div className="rounded-lg bg-page py-2">
              <p className="text-lg font-semibold">{data.summary.total}</p>
              <p className="text-xs text-ink-600">মোট</p>
            </div>
          </div>

          {data.records.length === 0 ? (
            <p className="text-sm text-ink-400 text-center py-4">
              এই মাসে কোনো শিক্ষার্থীর record নেই।
            </p>
          ) : (
            <ul className="divide-y divide-line">
              {data.records.map((r) => (
                <li key={r.id} className="py-2.5">
                  <div
                    className={`flex items-center justify-between ${
                      r.status !== "PENDING_VERIFICATION" ? "cursor-pointer" : ""
                    }`}
                    onClick={() =>
                      r.status !== "PENDING_VERIFICATION" && toggle(r)
                    }
                  >
                    <div>
                      <p className="text-sm font-medium">{r.student_name}</p>
                      <p className="text-xs text-ink-400">৳{r.amount}</p>
                      {r.status === "PENDING_VERIFICATION" && r.submitted_trx_id && (
                        <p className="text-xs text-warn mt-0.5">
                          {r.submitted_method} · TrxID: {r.submitted_trx_id}
                        </p>
                      )}
                    </div>
                    <Badge tone={tone(r.status)}>{label(r.status)}</Badge>
                  </div>

                  {/* Confirm বাটন — শুধু PENDING_VERIFICATION-এ */}
                  {r.status === "PENDING_VERIFICATION" && (
                    <div className="mt-2 flex justify-end">
                      <Button
                        className="!w-auto text-xs px-4 py-1.5"
                        onClick={() => confirm(r.id)}
                      >
                        ✓ Confirm করুন
                      </Button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
          <p className="text-xs text-ink-400 text-center">
            নামে tap করলে পরিশোধিত ⇄ বাকি বদলাবে (যাচাই-বাকি ছাড়া)
          </p>
        </>
      )}
    </div>
  );
}