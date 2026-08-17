import { useEffect, useState } from "react";
import { Wallet } from "lucide-react";
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
  if (status === "WAIVED") return "slate";
  return "err";
}

function label(status) {
  if (status === "PAID") return "পরিশোধিত";
  if (status === "PENDING_VERIFICATION") return "যাচাই হচ্ছে";
  if (status === "WAIVED") return "মাফ";
  return "বাকি";
}

export default function Payments() {
  const [data, setData] = useState(null);
  const [openForm, setOpenForm] = useState(null);
  const [trxId, setTrxId] = useState("");
  const [method, setMethod] = useState("BKASH");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [gatewayMsg] = useState(null);

  const load = () => {
    client.get("/api/payments/my/").then((res) => setData(res.data));
  };

  useEffect(load, []);

  const openSubmitForm = (recordId) => {
    setOpenForm(recordId);
    setTrxId("");
    setMethod("BKASH");
    setError("");
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

  const payWithGateway = async (recordId) => {
    try {
      const { data } = await client.post(`/api/payments/records/${recordId}/pay/`);
      window.location.href = data.gateway_url;
    } catch (err) {
      alert(err.response?.data?.detail || "Payment শুরু করা যায়নি।");
    }
  };

  // মোট বকেয়া হিসাব
  const dueTotal = data
    ? Object.values(data)
        .flat()
        .filter((r) => r.status === "DUE")
        .reduce((n, r) => n + Number(r.amount || 0), 0)
    : 0;

  return (
    <AppShell title="Payments">
      {data === null ? (
        <p className="text-sm text-ink-400">লোড হচ্ছে…</p>
      ) : Object.keys(data).length === 0 ? (
        <Card className="text-center py-12">
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl
            bg-emerald-50 text-ok">
            <Wallet className="h-6 w-6" />
          </div>
          <p className="text-sm text-ink-600">এখনো কোনো বেতনের হিসাব নেই</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* মোট বকেয়া hero */}
          {dueTotal > 0 && (
            <div className="grad-violet relative overflow-hidden rounded-2xl p-4 text-white
              shadow-brand">
              <p className="text-xs opacity-90">মোট বকেয়া</p>
              <p className="mt-0.5 text-2xl font-extrabold">৳ {dueTotal}</p>
              <Wallet className="absolute right-4 bottom-3 h-14 w-14 opacity-20" strokeWidth={1.5} />
              <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32
                rounded-full bg-white/10" />
            </div>
          )}

          {Object.entries(data).map(([batchName, records]) => (
            <Card key={batchName} className="!p-0 overflow-hidden">
              <h2 className="text-sm font-semibold px-4 pt-4 pb-2">{batchName}</h2>
              <ul className="divide-y divide-line">
                {records.map((r) => (
                  <li key={r.id} className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl
                        bg-page text-xs font-bold text-ink-600">
                        {new Date(r.month).toLocaleString("bn-BD", { month: "short" })}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold">
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
                        {r.status === "PENDING_VERIFICATION" && r.submitted_trx_id && (
                          <p className="text-xs text-warn mt-0.5">
                            TrxID: {r.submitted_trx_id}
                          </p>
                        )}
                      </div>
                      <Badge tone={tone(r.status)}>{label(r.status)}</Badge>
                    </div>

                    {r.status === "DUE" && (
                      <div className="mt-2.5 flex gap-2">
                        <Button
                          className="!w-auto text-xs px-4 py-2"
                          onClick={() => payWithGateway(r.id)}
                        >
                          Pay করুন
                        </Button>
                        <Button
                          variant="secondary"
                          className="!w-auto text-xs px-4 py-2"
                          onClick={() => openSubmitForm(r.id)}
                        >
                          TrxID জানান
                        </Button>
                      </div>
                    )}

                    {gatewayMsg === r.id && (
                      <div className="mt-2.5 rounded-xl bg-brand-50 p-3 text-xs
                        text-ink-600 leading-relaxed">
                        অনলাইন payment gateway শীঘ্রই আসছে। আপাতত bKash/Nagad-এ
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

                    {openForm === r.id && (
                      <div className="mt-2.5 space-y-2.5 rounded-xl bg-page p-3">
                        <p className="text-xs text-ink-600">
                          bKash/Nagad-এ টাকা পাঠানোর পর Transaction ID লিখুন।
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {METHODS.map(([value, l]) => (
                            <button
                              key={value}
                              type="button"
                              onClick={() => setMethod(value)}
                              className={`rounded-lg border px-3 py-2 text-xs transition
                                ${method === value
                                  ? "border-brand-600 bg-brand-50 font-semibold text-brand-700"
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
                          className="w-full rounded-xl border border-line px-3.5 py-2.5
                            text-sm outline-none focus:border-brand-500 focus:ring-2
                            focus:ring-brand-100"
                        />
                        {error && <p className="text-xs text-err">{error}</p>}
                        <div className="flex gap-2">
                          <Button
                            className="!w-auto text-xs px-4 py-2"
                            loading={busy}
                            onClick={() => submitPayment(r.id)}
                          >
                            জমা দিন
                          </Button>
                          <Button
                            variant="secondary"
                            className="!w-auto text-xs px-4 py-2"
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
