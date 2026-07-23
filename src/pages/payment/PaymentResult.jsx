import { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
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

  // Success হলে backend-এ যাচাই করি — IPN একটু দেরিতে আসতে পারে,
  // তাই কয়েকবার চেষ্টা করি (৩ সেকেন্ড পরপর, সর্বোচ্চ ৫ বার)
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
      icon: "🎉",
      title: "Payment সফল হয়েছে!",
      tone: "text-ok",
      body: "আপনার লেনদেন সম্পন্ন হয়েছে।",
    },
    failed: {
      icon: "❌",
      title: "Payment ব্যর্থ হয়েছে",
      tone: "text-err",
      body: "টাকা কাটা হয়ে থাকলে ২৪ ঘণ্টার মধ্যে ফেরত আসবে।",
    },
    cancelled: {
      icon: "⚠️",
      title: "Payment বাতিল হয়েছে",
      tone: "text-warn",
      body: "আপনি লেনদেনটি বাতিল করেছেন।",
    },
  }[status] || {
    icon: "❓",
    title: "অজানা অবস্থা",
    tone: "text-ink-600",
    body: "",
  };

  return (
    <AppShell title="Payment">
      <div className="max-w-md mx-auto py-6">
        <Card className="text-center py-10">
          {checking ? (
            <>
              <div className="text-4xl mb-3 animate-pulse">⏳</div>
              <p className="text-base font-semibold">যাচাই করা হচ্ছে…</p>
              <p className="mt-1 text-sm text-ink-600">
                একটু অপেক্ষা করুন, page বন্ধ করবেন না।
              </p>
            </>
          ) : (
            <>
              <div className="text-5xl mb-3">{config.icon}</div>
              <h2 className={`text-xl font-bold ${config.tone}`}>
                {config.title}
              </h2>
              <p className="mt-2 text-sm text-ink-600">{config.body}</p>

              {txn && txn.status === "SUCCESS" && (
                <div className="mt-4 rounded-lg bg-page p-3 text-left text-xs
                  space-y-1">
                  <div className="flex justify-between">
                    <span className="text-ink-600">পরিমাণ</span>
                    <span className="font-semibold">৳{Math.round(txn.amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-600">Transaction ID</span>
                    <span className="font-mono text-[11px]">{txn.tran_id}</span>
                  </div>
                </div>
              )}

              {/* IPN দেরি হলে — টাকা কেটেছে কিন্তু status এখনো আসেনি */}
              {status === "success" && txn && txn.status !== "SUCCESS" && (
                <div className="mt-4 rounded-lg bg-amber-50 p-3 text-xs text-warn">
                  Payment প্রক্রিয়াধীন। কয়েক মিনিটের মধ্যে নিশ্চিত হয়ে যাবে।
                  না হলে Transaction ID সহ যোগাযোগ করুন।
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