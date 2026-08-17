import { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle2, XCircle, AlertTriangle, Loader2, HelpCircle, FileText } from "lucide-react";
import client from "../../api/client";
import AppShell from "../../components/AppShell";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

export default function PaymentResult() {
  const { status } = useParams(); // success | failed | cancelled
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const tranId = params.get("tran_id");

  const [txn, setTxn] = useState(null);
  const [checking, setChecking] = useState(status === "success");
  const tries = useRef(0);

  useEffect(() => {
    if (status !== "success" || !tranId) return;

    const check = () => {
      client
        .get(`/api/payments/status/${tranId}/`)
        .then((res) => {
          setTxn(res.data);
          if (res.data.status === "SUCCESS" || tries.current >= 5) {
            setChecking(false);
          } else {
            tries.current += 1;
            setTimeout(check, 3000);
          }
        })
        .catch(() => setChecking(false));
    };

    check();
  }, [status, tranId]);

  const config = {
    success: {
      icon: CheckCircle2,
      title: "Payment সফল হয়েছে!",
      tone: "text-ok",
      tile: "bg-emerald-50 text-ok",
      body: "আপনার লেনদেন সম্পন্ন হয়েছে।",
    },
    failed: {
      icon: XCircle,
      title: "Payment ব্যর্থ হয়েছে",
      tone: "text-err",
      tile: "bg-red-50 text-err",
      body: "টাকা কাটা হয়ে থাকলে ২৪ ঘণ্টার মধ্যে ফেরত আসবে।",
    },
    cancelled: {
      icon: AlertTriangle,
      title: "Payment বাতিল হয়েছে",
      tone: "text-warn",
      tile: "bg-amber-50 text-warn",
      body: "আপনি লেনদেনটি বাতিল করেছেন।",
    },
  }[status] || {
    icon: HelpCircle,
    title: "অজানা অবস্থা",
    tone: "text-ink-600",
    tile: "bg-slate-100 text-slate-500",
    body: "",
  };

  const Icon = config.icon;

  return (
    <AppShell title="Payment">
      <div className="max-w-md mx-auto py-6">
        <Card className="text-center py-10">
          {checking ? (
            <>
              <Loader2 className="mx-auto mb-3 h-10 w-10 animate-spin text-brand-500" />
              <p className="text-base font-semibold">যাচাই করা হচ্ছে…</p>
              <p className="mt-1 text-sm text-ink-600">
                একটু অপেক্ষা করুন, page বন্ধ করবেন না।
              </p>
            </>
          ) : (
            <>
              <div className={`mx-auto mb-4 grid h-20 w-20 place-items-center
                rounded-3xl ${config.tile}`}>
                <Icon className="h-11 w-11" strokeWidth={2} />
              </div>
              <h2 className={`text-xl font-bold ${config.tone}`}>{config.title}</h2>
              <p className="mt-2 text-sm text-ink-600">{config.body}</p>

              {txn && txn.status === "SUCCESS" && (
                <div className="mt-4 rounded-xl bg-page p-4 text-left text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-ink-600">পরিমাণ</span>
                    <span className="font-bold">৳{Math.round(txn.amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-600">Transaction ID</span>
                    <span className="font-mono text-[11px]">{txn.tran_id}</span>
                  </div>
                </div>
              )}

              {status === "success" && txn && txn.status !== "SUCCESS" && (
                <div className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50 p-3
                  text-left text-xs text-warn">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    Payment প্রক্রিয়াধীন। কয়েক মিনিটের মধ্যে নিশ্চিত হয়ে যাবে।
                    না হলে Transaction ID সহ যোগাযোগ করুন।
                  </span>
                </div>
              )}

              <div className="mt-6 space-y-2">
                <Button onClick={() => navigate("/teacher/subscription")}>
                  Subscription-এ যান
                </Button>
                <Button variant="secondary" onClick={() => navigate("/")}>
                  হোমে ফিরুন
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
