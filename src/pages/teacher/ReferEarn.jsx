import { useEffect, useState } from "react";
import { Gift, Copy, Check, Target, PartyPopper, MessageCircle } from "lucide-react";
import client from "../../api/client";
import Card from "../../components/ui/Card";

const APP_URL = window.location.origin;

export default function ReferEarn() {
  const [stats, setStats] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    client.get("/api/referrals/stats/").then((res) => setStats(res.data));
  }, []);

  if (!stats) return <p className="text-sm text-ink-400">লোড হচ্ছে…</p>;

  const link = `${APP_URL}/register?ref=${stats.referral_code}`;
  const target = stats.milestone_target;
  const count = stats.successful_referrals_count;
  const pct = Math.min(100, (count / target) * 100);
  const remaining = Math.max(0, target - count);

  const copyLink = async () => {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const waMessage = encodeURIComponent(
    `আসসালামু আলাইকুম। আমি Agami দিয়ে আমার কোচিং চালাই — attendance, ` +
    `বেতন, ফলাফল সব এক জায়গায়। আমার লিংক দিয়ে join করলে প্রথম subscription-এ ` +
    `১০% ছাড় পাবেন: ${link}`
  );

  return (
    <div className="space-y-4">
      {/* বর্তমান ছাড় — gradient hero */}
      <div className="grad-brand shadow-brand relative overflow-hidden rounded-2xl p-5
        text-center text-white">
        <p className="text-xs opacity-90">আপনার বর্তমান ছাড়</p>
        <p className="mt-1 text-4xl font-extrabold">{stats.current_discount_percentage}%</p>
        <p className="mt-1 text-xs opacity-90">পরের subscription-এ প্রযোজ্য হবে</p>
        <Gift className="absolute right-4 bottom-3 h-14 w-14 opacity-20" strokeWidth={1.5} />
        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
      </div>

      {/* Milestone progress */}
      <Card>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold">Milestone অগ্রগতি</p>
          <p className="text-xs text-ink-400">{count} / {target}</p>
        </div>
        <div className="h-2.5 rounded-full bg-page overflow-hidden">
          <div
            className="h-full grad-brand transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        {remaining > 0 ? (
          <p className="mt-2 flex items-start gap-1.5 text-xs text-ink-600">
            <Target className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-600" />
            <span>
              আর <strong>{remaining} জন</strong> শিক্ষককে আনলে{" "}
              <strong className="text-brand-600">{stats.milestone_discount}% ছাড়</strong> unlock হবে!
            </span>
          </p>
        ) : (
          <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-ok">
            <PartyPopper className="h-3.5 w-3.5" /> {stats.milestone_discount}% ছাড় unlock হয়েছে!
          </p>
        )}
      </Card>

      {/* Referral code + share */}
      <Card className="space-y-3">
        <div>
          <p className="text-xs text-ink-600 mb-1.5">আপনার Referral Code</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded-xl bg-page px-4 py-3 text-lg font-bold
              tracking-wider text-center text-brand-700">
              {stats.referral_code}
            </code>
            <button
              onClick={copyLink}
              className="inline-flex items-center gap-1.5 rounded-xl border border-line
                px-4 py-3 text-sm font-medium hover:bg-page whitespace-nowrap"
            >
              {copied ? <Check className="h-4 w-4 text-ok" /> : <Copy className="h-4 w-4" />}
              {copied ? "কপি" : "লিংক"}
            </button>
          </div>
        </div>

        <a
          href={`https://wa.me/?text=${waMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600
            py-3 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
        >
          <MessageCircle className="h-4 w-4" /> WhatsApp-এ invite করুন
        </a>
      </Card>

      {/* Referral তালিকা */}
      <Card>
        <p className="text-sm font-semibold mb-3">
          আপনার Referral ({stats.lifetime_referrals} জন মোট)
        </p>
        {stats.referrals.length === 0 ? (
          <p className="text-xs text-ink-400 text-center py-4">
            এখনো কাউকে refer করেননি।
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {stats.referrals.map((r, i) => (
              <li key={i} className="flex items-center justify-between py-2.5">
                <span className="text-sm">{r.invitee_name}</span>
                <span className={`text-xs font-medium ${
                  r.status === "CONVERTED" ? "text-ok" : "text-warn"
                }`}>
                  {r.status === "CONVERTED" ? "✓ subscription নিয়েছেন" : "⏳ অপেক্ষমাণ"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
