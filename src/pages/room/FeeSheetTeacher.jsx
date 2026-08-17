import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import client from "../../api/client";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Avatar from "../../components/ui/Avatar";
import StatTile from "../../components/ui/StatTile";

const monthStr = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

function tone(status) {
  if (status === "PAID") return "ok";
  if (status === "PENDING_VERIFICATION") return "warn";
  if (status === "WAIVED") return "slate";
  return "err";
}

function label(status) {
  if (status === "PAID") return "পরিশোধিত";
  if (status === "PENDING_VERIFICATION") return "যাচাই বাকি";
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
    await client.put(`/api/batches/${batchId}/fee/`, { monthly_fee: feeInput });
    setFee(feeInput);
    setBusy(false);
  };

  const toggle = async (record) => {
    const next = record.status === "PAID" ? "DUE" : "PAID";
    await client.post(`/api/payments/records/${record.id}/mark/`, {
      status: next,
      method: next === "PAID" ? "CASH" : "",
    });
    loadRecords();
  };

  const confirm = async (recordId) => {
    await client.post(`/api/payments/records/${recordId}/confirm/`);
    loadRecords();
  };

  const shiftMonth = (delta) => {
    const d = new Date(month);
    d.setMonth(d.getMonth() + delta);
    setMonth(d);
  };

  if (fee === undefined) return <p className="text-sm text-ink-400">লোড হচ্ছে…</p>;

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
            className="flex-1 rounded-xl border border-line px-3.5 py-2.5 text-sm
              outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
          <Button className="!w-auto" onClick={saveFee} loading={busy} disabled={!feeInput}>
            Set করুন
          </Button>
        </div>
      </div>
    );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-600">
          মাসিক বেতন: <span className="font-bold text-ink-900">৳{fee}</span>
        </p>
        <div className="flex items-center gap-1 text-sm">
          <button onClick={() => shiftMonth(-1)}
            className="grid h-8 w-8 place-items-center rounded-lg hover:bg-page">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="font-medium">
            {month.toLocaleString("bn-BD", { month: "long", year: "numeric" })}
          </span>
          <button onClick={() => shiftMonth(1)}
            className="grid h-8 w-8 place-items-center rounded-lg hover:bg-page">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {data === null ? (
        <p className="text-sm text-ink-400">লোড হচ্ছে…</p>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2">
            <StatTile value={data.summary.paid} label="পরিশোধিত" tone="ok" />
            <StatTile value={data.summary.due} label="বাকি" tone="err" />
            <StatTile value={data.summary.total} label="মোট" />
          </div>

          {data.records.length === 0 ? (
            <p className="text-sm text-ink-400 text-center py-4">
              এই মাসে কোনো শিক্ষার্থীর record নেই।
            </p>
          ) : (
            <ul className="rounded-2xl border border-line bg-surface shadow-soft
              divide-y divide-line overflow-hidden">
              {data.records.map((r) => (
                <li key={r.id} className="px-3 py-2.5">
                  <div
                    className={`flex items-center gap-2.5 ${
                      r.status !== "PENDING_VERIFICATION" ? "cursor-pointer" : ""
                    }`}
                    onClick={() => r.status !== "PENDING_VERIFICATION" && toggle(r)}
                  >
                    <Avatar name={r.student_name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold truncate">{r.student_name}</p>
                      <p className="text-xs text-ink-400">৳{r.amount}</p>
                      {r.status === "PENDING_VERIFICATION" && r.submitted_trx_id && (
                        <p className="text-xs text-warn mt-0.5">
                          {r.submitted_method} · TrxID: {r.submitted_trx_id}
                        </p>
                      )}
                    </div>
                    <Badge tone={tone(r.status)}>{label(r.status)}</Badge>
                  </div>

                  {r.status === "PENDING_VERIFICATION" && (
                    <div className="mt-2 flex justify-end">
                      <Button className="!w-auto text-xs px-4 py-1.5" onClick={() => confirm(r.id)}>
                        <Check className="h-3.5 w-3.5" /> Confirm করুন
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
