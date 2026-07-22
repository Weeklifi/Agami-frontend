import { useEffect, useState } from "react";
import client from "../../api/client";
import AppShell from "../../components/AppShell";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";

const METHODS = [
  ["BKASH", "bKash"],
  ["NAGAD", "Nagad"],
  ["BANK", "Bank"],
  ["OTHER", "অন্যান্য"],
];

function tone(status) {
  if (status === "PAID") return "ok";
  if (status === "PENDING_VERIFICATION") return "warn";
  if (status === "WAIVED") return "neutral";
  return "err";
}

function label(status) {
  if (status === "PAID") return "✓ পরিশোধিত";
  if (status === "PENDING_VERIFICATION") return "⏳ যাচাই হচ্ছে";
  if (status === "WAIVED") return "মাফ";
  return "বাকি";
}

export default function Payments() {
  const [data, setData] = useState(null);
  const [openForm, setOpenForm] = useState(null); // কোন record-এর TrxID form খোলা
  const [trxId, setTrxId] = useState("");
  const [method, setMethod] = useState("BKASH");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [gatewayMsg, setGatewayMsg] = useState(null); // "Pay করুন" চাপলে বার্তা

  const load = () => {
    client.get("/api/payments/my/").then((res) => setData(res.data));
  };

  useEffect(load, []);

  const openSubmitForm = (recordId) => {
    setOpenForm(recordId);
    setTrxId("");
    setMethod("BKASH");
    setError("");
    setGatewayMsg(null);
  };

  const submitPayment = async (recordId) => {
    if (!trxId.trim()) {
      setError("Transaction ID লিখুন।");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await client.post(`/api/payments/records/${recordId}/submit/`, {
        trx_id: trxId.trim(),
        method,
      });
      setOpenForm(null);
      load();
    } catch (err) {
      setError(err.response?.data?.detail || "জমা দেওয়া যায়নি।");
    } finally {
      setBusy(false);
    }
  };

  // Gateway এখনো নেই — placeholder। Deploy-এর পরে এখানেই SSLCommerz redirect বসবে।
  const payWithGateway = (recordId) => {
    setOpenForm(null);
    setGatewayMsg(recordId);
  };

  return (
    <AppShell title="Payments">
      {data === null ? (
        <p className="text-sm text-ink-400">লোড হচ্ছে…</p>
      ) : Object.keys(data).length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-sm text-ink-600">এখনো কোনো বেতনের হিসাব নেই</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {Object.entries(data).map(([batchName, records]) => (
            <Card key={batchName}>
              <h2 className="text-sm font-semibold mb-3">{batchName}</h2>
              <ul className="divide-y divide-line">
                {records.map((r) => (
                  <li key={r.id} className="py-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">
                          {new Date(r.month).toLocaleString("bn-BD", {
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                        <p className="text-xs text-ink-400">
                          ৳{r.amount}
                          {r.paid_at &&
                            ` · ${new Date(r.paid_at).toLocaleDateString("bn-BD")}`}
                        </p>
                        {r.status === "PENDING_VERIFICATION" &&
                          r.submitted_trx_id && (
                            <p className="text-xs text-warn mt-0.5">
                              TrxID: {r.submitted_trx_id}
                            </p>
                          )}
                      </div>
                      <Badge tone={tone(r.status)}>{label(r.status)}</Badge>
                    </div>

                    {/* DUE হলে দুটো path: Pay করুন (gateway) + TrxID জানান (manual) */}
                    {r.status === "DUE" && (
                      <div className="mt-2.5 flex gap-2">
                        <Button
                          className="!w-auto text-xs px-4 py-1.5"
                          onClick={() => payWithGateway(r.id)}
                        >
                          Pay করুন
                        </Button>
                        <Button
                          variant="secondary"
                          className="!w-auto text-xs px-4 py-1.5"
                          onClick={() => openSubmitForm(r.id)}
                        >
                          TrxID জানান
                        </Button>
                      </div>
                    )}

                    {/* Gateway placeholder বার্তা */}
                    {gatewayMsg === r.id && (
                      <div className="mt-2.5 rounded-lg bg-brand-50 p-3 text-xs
                        text-ink-600 leading-relaxed">
                        💳 অনলাইন payment gateway শীঘ্রই আসছে। আপাতত bKash/Nagad-এ
                        টাকা পাঠিয়ে{" "}
                        <button
                          onClick={() => openSubmitForm(r.id)}
                          className="text-brand-600 font-medium hover:underline"
                        >
                          TrxID জানান
                        </button>{" "}
                        — শিক্ষক যাচাই করে confirm করবেন।
                      </div>
                    )}

                    {/* Manual TrxID form */}
                    {openForm === r.id && (
                      <div className="mt-2.5 space-y-2.5 rounded-lg bg-page p-3">
                        <p className="text-xs text-ink-600">
                          bKash/Nagad-এ টাকা পাঠানোর পর Transaction ID লিখুন।
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {METHODS.map(([value, l]) => (
                            <button
                              key={value}
                              type="button"
                              onClick={() => setMethod(value)}
                              className={`rounded-lg border px-3 py-1.5 text-xs
                                ${
                                  method === value
                                    ? "border-brand-600 bg-brand-50 font-medium"
                                    : "border-line"
                                }`}
                            >
                              {l}
                            </button>
                          ))}
                        </div>
                        <input
                          placeholder="Transaction ID"
                          value={trxId}
                          onChange={(e) => setTrxId(e.target.value)}
                          className="w-full rounded-lg border border-line px-3.5
                            py-2 text-sm outline-none focus:border-brand-500"
                        />
                        {error && <p className="text-xs text-err">{error}</p>}
                        <div className="flex gap-2">
                          <Button
                            className="!w-auto text-xs px-4"
                            loading={busy}
                            onClick={() => submitPayment(r.id)}
                          >
                            জমা দিন
                          </Button>
                          <Button
                            variant="secondary"
                            className="!w-auto text-xs px-4"
                            onClick={() => setOpenForm(null)}
                          >
                            বাতিল
                          </Button>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}