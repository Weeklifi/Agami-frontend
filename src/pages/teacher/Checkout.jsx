import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import client from "../../api/client";
import AppShell from "../../components/AppShell";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

export default function Checkout() {
  const { planId } = useParams();
  const navigate = useNavigate();

  const [plan, setPlan] = useState(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  // Professional info form
  const [form, setForm] = useState({
    institution_name: "",
    subject: "",
    contact_number: "",
    district: "",
  });

  // Referral
  const [refCode, setRefCode] = useState("");
  const [refState, setRefState] = useState(null);
  const [validating, setValidating] = useState(false);

  // Pricing
  const [pricing, setPricing] = useState(null);
  const [reason, setReason] = useState(null);

  useEffect(() => {
    client.get("/api/subscriptions/plans/").then((res) => {
      const list = res.data.results || res.data;
      setPlan(list.find((p) => p.id === planId) || null);
    });

    const savedRef = localStorage.getItem("referral_code");
    if (savedRef) {
      setRefCode(savedRef);
      validateCode(savedRef);
    }

    client.get("/api/referrals/profile/").then((res) => {
      setForm((f) => ({
        ...f,
        institution_name: res.data.institution_name || "",
        subject: res.data.subject || "",
        contact_number: res.data.contact_number || "",
        district: res.data.district || "",
      }));
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planId]);

  useEffect(() => {
    if (!plan) return;
    recalcPrice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan, refState]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const validateCode = async (code) => {
    if (!code.trim()) {
      setRefState(null);
      return;
    }
    setValidating(true);
    try {
      const { data } = await client.post("/api/referrals/validate-code/", {
        code: code.trim(),
      });
      setRefState(data);
    } catch (err) {
      setRefState({
        valid: false,
        detail: err.response?.data?.detail || "কোডটি সঠিক নয়।",
      });
    } finally {
      setValidating(false);
    }
  };

  const recalcPrice = async () => {
    try {
      const { data } = await client.post("/api/referrals/checkout-init/", {
        plan_id: planId,
        referral_code: refState?.valid ? refCode.trim() : "",
        ...form,
      });
      setPricing(data.pricing);
      setReason(data.discount_reason);
    } catch {
      setPricing({
        base_price: plan.price,
        discount_percent: 0,
        discount_amount: 0,
        final_price: plan.price,
      });
    }
  };

  const pay = async () => {
    setBusy(true);
    setError("");
    try {
      await client.post("/api/subscriptions/subscribe/", { plan_id: planId });
      localStorage.removeItem("referral_code");
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.detail || "Payment ব্যর্থ হয়েছে।");
    } finally {
      setBusy(false);
    }
  };

  if (!plan)
    return (
      <AppShell title="Checkout">
        <p className="text-sm text-ink-400">লোড হচ্ছে…</p>
      </AppShell>
    );

  if (done)
    return (
      <AppShell title="Payment সফল">
        <div className="max-w-md mx-auto text-center py-8">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-xl font-bold">Payment সফল হয়েছে!</h2>
          <p className="mt-2 text-sm text-ink-600">
            "{plan.name}" এখন active। আপনি এখন batch তৈরি করতে পারবেন।
          </p>
          <div className="mt-6">
            <Button
              className="!w-auto px-6 mx-auto"
              onClick={() => navigate("/teacher/subscription")}
            >
              Subscription-এ ফিরে যান
            </Button>
          </div>
        </div>
      </AppShell>
    );

  const price = pricing || {
    base_price: plan.price,
    discount_percent: 0,
    discount_amount: 0,
    final_price: plan.price,
  };

  return (
    <AppShell title="Checkout">
      <div className="max-w-md mx-auto space-y-4">
        {/* Professional info */}
        <Card className="space-y-3">
          <h2 className="text-base font-bold">আপনার তথ্য</h2>
          <FormField label="কোচিং সেন্টারের নাম" value={form.institution_name} onChange={set("institution_name")} />
          <FormField label="কী পড়ান" value={form.subject} onChange={set("subject")} />
          <FormField label="মোবাইল নম্বর" value={form.contact_number} onChange={set("contact_number")} />
          <FormField label="জেলা" value={form.district} onChange={set("district")} />
        </Card>

        {/* Referral code */}
        <Card className="space-y-2">
          <label className="text-sm font-semibold">Referral Code (থাকলে)</label>
          <div className="flex gap-2">
            <input
              value={refCode}
              onChange={(e) => {
                setRefCode(e.target.value.toUpperCase());
                setRefState(null);
              }}
              placeholder="যেমন ABCD1234"
              className="flex-1 rounded-lg border border-line px-3.5 py-2 text-sm
                uppercase tracking-wider outline-none focus:border-brand-500"
            />
            <Button
              variant="secondary"
              className="!w-auto px-4"
              loading={validating}
              onClick={() => validateCode(refCode)}
            >
              যাচাই
            </Button>
          </div>
          {refState?.valid && (
            <p className="text-xs text-ok">
              ✓ {refState.referrer_name}-এর কোড — {refState.discount_percent}% ছাড় প্রযোজ্য
            </p>
          )}
          {refState && !refState.valid && (
            <p className="text-xs text-err">{refState.detail}</p>
          )}
        </Card>

        {/* Order summary */}
        <Card>
          <h2 className="text-base font-bold mb-4">Order সারসংক্ষেপ</h2>

          <div className="flex items-center justify-between py-2 border-b border-line">
            <span className="text-sm text-ink-600">Plan</span>
            <span className="text-sm font-medium">{plan.name}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-line">
            <span className="text-sm text-ink-600">মূল দাম</span>
            <span className="text-sm">৳{Math.round(price.base_price)}</span>
          </div>

          {price.discount_percent > 0 && (
            <div className="flex items-center justify-between py-2 border-b border-line text-ok">
              <span className="text-sm">
                ছাড় ({price.discount_percent}%)
                {reason?.type === "referrer" && " · referral bonus"}
              </span>
              <span className="text-sm font-medium">
                −৳{Math.round(price.discount_amount)}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between py-3">
            <span className="text-sm font-semibold">মোট</span>
            <span className="text-xl font-bold">৳{Math.round(price.final_price)}</span>
          </div>

          {price.discount_percent > 0 && (
            <div className="rounded-lg bg-emerald-50 p-2.5 text-xs text-ok text-center">
              🎉 আপনি {price.discount_percent}% ছাড় পেয়েছেন!
            </div>
          )}

          <div className="mt-4 rounded-lg bg-amber-50 p-3 text-xs text-warn leading-relaxed">
            💳 অনলাইন gateway (bKash/Nagad/Card) শীঘ্রই যুক্ত হবে। এখন dev mode-এ
            "Pay করুন" চাপলে সরাসরি activate হবে।
          </div>

          {error && <p className="mt-3 text-sm text-err">{error}</p>}

          <div className="mt-5 space-y-2">
            <Button loading={busy} onClick={pay}>
              💳 ৳{Math.round(price.final_price)} Pay করুন
            </Button>
            <Button variant="secondary" onClick={() => navigate("/teacher/plans")}>
              বাতিল
            </Button>
          </div>
        </Card>

        <p className="text-center text-xs text-ink-400">🔒 আপনার তথ্য সুরক্ষিত</p>
      </div>
    </AppShell>
  );
}

function FormField({ label, value, onChange }) {
  return (
    <div>
      <label className="text-xs text-ink-600 block mb-1">{label}</label>
      <input
        value={value}
        onChange={onChange}
        className="w-full rounded-lg border border-line px-3.5 py-2 text-sm
          outline-none focus:border-brand-500"
      />
    </div>
  );
}