import { useEffect, useState } from "react";
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
  const target = stats.milestone_target;      // 5
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
      {/* বর্তমান ছাড় */}
      <Card className="text-center bg-brand-50 border-brand-200">
        <p className="text-xs text-ink-600 mb-1">আপনার বর্তমান ছাড়</p>
        <p className="text-4xl font-bold text-brand-700">
          {stats.current_discount_percentage}%
        </p>
        <p className="text-xs text-ink-600 mt-1">
          পরের subscription-এ প্রযোজ্য হবে
        </p>
      </Card>

      {/* Gamified progress */}
      <Card>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold">Milestone অগ্রগতি</p>
          <p className="text-xs text-ink-400">
            {count} / {target}
          </p>
        </div>
        <div className="h-3 rounded-full bg-page overflow-hidden">
          <div
            className="h-full bg-brand-600 transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        {remaining > 0 ? (
          <p className="mt-2 text-xs text-ink-600">
            🎯 আর <strong>{remaining} জন</strong> শিক্ষককে আনলে{" "}
            <strong className="text-brand-600">{stats.milestone_discount}% ছাড়</strong> unlock হবে!
          </p>
        ) : (
          <p className="mt-2 text-xs text-ok font-medium">
            🎉 {stats.milestone_discount}% ছাড় unlock হয়েছে!
          </p>
        )}
      </Card>

      {/* Referral code + share */}
      <Card className="space-y-3">
        <div>
          <p className="text-xs text-ink-600 mb-1">আপনার Referral Code</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded-lg bg-page px-4 py-2.5 text-lg
              font-bold tracking-wider text-center">
              {stats.referral_code}
            </code>
            <button
              onClick={copyLink}
              className="rounded-lg border border-line px-4 py-2.5 text-sm
                font-medium hover:bg-page whitespace-nowrap"
            >
              {copied ? "✓ কপি" : "📋 লিংক"}
            </button>
          </div>
        </div>

        {/* এখানে ভুলটি ঠিক করা হয়েছে (<a যোগ করা হয়েছে) */}
        <a
          href={`https://wa.me/?text=${waMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center rounded-lg bg-green-600 text-white
            py-2.5 text-sm font-medium hover:bg-green-700 transition-colors"
        >
          💬 WhatsApp-এ invite করুন
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
              <li key={i} className="flex items-center justify-between py-2">
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