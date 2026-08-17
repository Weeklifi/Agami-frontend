import { useEffect, useState } from "react";
import { Gift, Check } from "lucide-react";
import client from "../../api/client";
import AppShell from "../../components/AppShell";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import { useAuth } from "../../context/AuthContext";
import ReferEarn from "./ReferEarn";

const daysLeft = (iso) =>
  Math.max(0, Math.ceil((new Date(iso) - new Date()) / 86400000));

export default function Profile() {
  const { user } = useAuth();
  const [tab, setTab] = useState("profile"); // profile | refer
  const [sub, setSub] = useState(null);
  const [form, setForm] = useState({
    institution_name: "",
    subject: "",
    contact_number: "",
    district: "",
    address: "",
  });
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    client.get("/api/referrals/profile/").then((res) => {
      setForm({
        institution_name: res.data.institution_name || "",
        subject: res.data.subject || "",
        contact_number: res.data.contact_number || "",
        district: res.data.district || "",
        address: res.data.address || "",
      });
    });
    client.get("/api/subscriptions/me/").then((res) => setSub(res.data));
  }, []);

  const save = async () => {
    setBusy(true);
    setSaved(false);
    try {
      await client.patch("/api/referrals/profile/", form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setBusy(false);
    }
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const subStatus = () => {
    if (!sub || !sub.active) return { label: "নেই", tone: "err" };
    if (sub.subscription?.is_trial)
      return { label: `Trial · ${daysLeft(sub.subscription.end_date)} দিন`, tone: "warn" };
    return { label: `সক্রিয় · ${daysLeft(sub.subscription.end_date)} দিন`, tone: "ok" };
  };

  const st = subStatus();
  const fullName =
    `${user?.first_name || ""} ${user?.last_name || ""}`.trim() || user?.email;

  return (
    <AppShell title="Profile">
      <div className="max-w-2xl space-y-4">
        {/* Gradient header */}
        <div className="grad-brand shadow-brand relative overflow-hidden rounded-2xl
          p-5 text-center text-white">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full
            bg-white/20 text-2xl font-extrabold">
            {(user?.first_name?.[0] || user?.email?.[0] || "?").toUpperCase()}
          </div>
          <p className="mt-3 text-lg font-bold">{fullName}</p>
          <p className="text-xs opacity-90">{user?.email} · শিক্ষক</p>
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/20
            px-3 py-1 text-xs font-semibold">
            Subscription: {st.label}
          </div>
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32
            rounded-full bg-white/10" />
        </div>

        {/* Segmented tabs */}
        <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
          <button
            onClick={() => setTab("profile")}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition
              ${tab === "profile" ? "bg-surface text-brand-600 shadow-soft" : "text-ink-600"}`}
          >
            তথ্য
          </button>
          <button
            onClick={() => setTab("refer")}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition
              inline-flex items-center justify-center gap-1.5
              ${tab === "refer" ? "bg-surface text-brand-600 shadow-soft" : "text-ink-600"}`}
          >
            <Gift className="h-4 w-4" /> Refer &amp; Earn
          </button>
        </div>

        {tab === "profile" ? (
          <Card className="space-y-3">
            <Field label="কোচিং সেন্টারের নাম" value={form.institution_name} onChange={set("institution_name")} />
            <Field label="কী পড়ান (বিষয়)" value={form.subject} onChange={set("subject")} />
            <Field label="মোবাইল নম্বর" value={form.contact_number} onChange={set("contact_number")} />
            <Field label="জেলা" value={form.district} onChange={set("district")} />
            <Field label="ঠিকানা" value={form.address} onChange={set("address")} />
            <div className="flex items-center gap-3 pt-1">
              <Button className="!w-auto px-6" loading={busy} onClick={save}>
                সংরক্ষণ করুন
              </Button>
              {saved && (
                <span className="flex items-center gap-1 text-sm text-ok">
                  <Check className="h-4 w-4" /> সংরক্ষিত
                </span>
              )}
            </div>
          </Card>
        ) : (
          <ReferEarn />
        )}
      </div>
    </AppShell>
  );
}

function Field({ label, value, onChange }) {
  return (
    <div>
      <label className="text-xs font-medium text-ink-700 block mb-1">{label}</label>
      <input
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-line px-3.5 py-2.5 text-sm
          outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
      />
    </div>
  );
}
