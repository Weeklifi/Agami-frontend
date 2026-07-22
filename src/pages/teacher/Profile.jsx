import { useEffect, useState } from "react";
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
  const [profile, setProfile] = useState(null);
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
      setProfile(res.data);
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
    if (!sub || !sub.active)
      return { label: "নেই", tone: "err" };
    if (sub.subscription?.is_trial)
      return { label: `Trial · ${daysLeft(sub.subscription.end_date)} দিন`, tone: "warn" };
    return { label: `সক্রিয় · ${daysLeft(sub.subscription.end_date)} দিন`, tone: "ok" };
  };

  const st = subStatus();

  return (
    <AppShell title="Profile">
      <div className="max-w-2xl space-y-5">
        {/* Header card */}
        <Card>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-brand-600 text-white
              flex items-center justify-center text-xl font-bold">
              {(user?.first_name?.[0] || user?.email?.[0] || "?").toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-bold truncate">
                {`${user?.first_name || ""} ${user?.last_name || ""}`.trim() || user?.email}
              </p>
              <p className="text-xs text-ink-400 truncate">{user?.email}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-xs text-ink-400 mb-1">Subscription</p>
              <Badge tone={st.tone}>{st.label}</Badge>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-line">
          <button
            onClick={() => setTab("profile")}
            className={`px-4 py-2 text-sm ${
              tab === "profile"
                ? "border-b-2 border-brand-600 font-medium text-brand-600"
                : "text-ink-600"
            }`}
          >
            তথ্য
          </button>
          <button
            onClick={() => setTab("refer")}
            className={`px-4 py-2 text-sm ${
              tab === "refer"
                ? "border-b-2 border-brand-600 font-medium text-brand-600"
                : "text-ink-600"
            }`}
          >
            🎁 Refer & Earn
          </button>
        </div>

        {tab === "profile" ? (
          <Card className="space-y-3">
            <Field label="কোচিং সেন্টারের নাম" value={form.institution_name} onChange={set("institution_name")} />
            <Field label="কী পড়ান (বিষয়)" value={form.subject} onChange={set("subject")} />
            <Field label="মোবাইল নম্বর" value={form.contact_number} onChange={set("contact_number")} />
            <Field label="জেলা" value={form.district} onChange={set("district")} />
            <Field label="ঠিকানা" value={form.address} onChange={set("address")} />
            <div className="flex items-center gap-3">
              <Button className="!w-auto px-6" loading={busy} onClick={save}>
                সংরক্ষণ করুন
              </Button>
              {saved && <span className="text-sm text-ok">✓ সংরক্ষিত</span>}
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