import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import client from "../../api/client";
import AppShell from "../../components/AppShell";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

// SMS প্যাকেজ — admin পরে configurable করা যাবে
const PACKAGES = [
  { credits: 100, price: 50, popular: false },
  { credits: 500, price: 225, popular: true },
  { credits: 1000, price: 400, popular: false },
  { credits: 2000, price: 750, popular: false },
];

export default function SmsRecharge() {
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
  const [selected, setSelected] = useState(null);
  const [gatewayMsg, setGatewayMsg] = useState(false);

  useEffect(() => {
    client
      .get("/api/sms/balance/")
      .then((res) => setBalance(res.data.balance))
      .catch(() => {});
  }, []);

  // Gateway এখনো নেই — placeholder
  const buy = () => {
    setGatewayMsg(true);
  };

  return (
    <AppShell title="SMS Recharge">
      <div className="max-w-2xl space-y-5">
        {/* বর্তমান balance */}
        <Card className="flex items-center justify-between">
          <div>
            <p className="text-xs text-ink-400">বর্তমান SMS ব্যালেন্স</p>
            <p className="text-3xl font-bold">{balance}</p>
          </div>
          <div className="text-4xl">📨</div>
        </Card>

        {/* প্যাকেজ */}
        <div>
          <h2 className="text-sm font-semibold mb-3">প্যাকেজ বেছে নিন</h2>
          <div className="grid grid-cols-2 gap-3">
            {PACKAGES.map((pkg) => {
              const isSelected = selected?.credits === pkg.credits;
              return (
                <button
                  key={pkg.credits}
                  onClick={() => {
                    setSelected(pkg);
                    setGatewayMsg(false);
                  }}
                  className={`relative rounded-xl border-2 p-4 text-left transition-all
                    ${
                      isSelected
                        ? "border-brand-600 bg-brand-50"
                        : "border-line hover:border-brand-300"
                    }`}
                >
                  {pkg.popular && (
                    <span className="absolute -top-2.5 left-3 rounded-full
                      bg-brand-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                      জনপ্রিয়
                    </span>
                  )}
                  <p className="text-2xl font-bold">{pkg.credits}</p>
                  <p className="text-xs text-ink-400">SMS</p>
                  <p className="mt-2 text-lg font-semibold text-brand-700">
                    ৳{pkg.price}
                  </p>
                  <p className="text-[11px] text-ink-400">
                    প্রতি SMS ৳{(pkg.price / pkg.credits).toFixed(2)}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Gateway placeholder বার্তা */}
        {gatewayMsg && (
          <Card className="bg-amber-50 border-amber-200">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🚧</span>
              <div>
                <p className="text-sm font-semibold text-warn">
                  Payment gateway শীঘ্রই আসছে
                </p>
                <p className="mt-1 text-xs text-ink-600 leading-relaxed">
                  অনলাইন SMS কেনার ব্যবস্থা (bKash/Nagad/Card) খুব শীঘ্রই যুক্ত
                  হবে। ততক্ষণ পর্যন্ত SMS credit-এর জন্য আমাদের সাথে সরাসরি
                  যোগাযোগ করুন।
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* কেনার বাটন */}
        {selected && (
          <div className="space-y-2">
            <div className="flex items-center justify-between rounded-lg bg-page p-3">
              <span className="text-sm">
                {selected.credits} SMS
              </span>
              <span className="text-lg font-bold">৳{selected.price}</span>
            </div>
            <Button onClick={buy}>
              💳 ৳{selected.price} — Recharge করুন
            </Button>
          </div>
        )}

        <button
          onClick={() => navigate("/teacher/sms")}
          className="text-xs text-brand-600 hover:underline"
        >
          ‹ Bulk SMS-এ ফিরে যান
        </button>
      </div>
    </AppShell>
  );
}