import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ChevronLeft, Search, Users, ClipboardCheck, BarChart3, Calendar,
  Wallet, UserPlus, KeyRound,
} from "lucide-react";
import { formatDateTime } from "../../lib/postTypes";

function ToolButton({ icon: Icon, tone = "slate", label, badge, onClick }) {
  const tones = {
    indigo: "bg-brand-50 text-brand-600",
    violet: "bg-violet-50 text-violet-600",
    emerald: "bg-emerald-50 text-ok",
    amber: "bg-amber-50 text-warn",
    sky: "bg-sky-50 text-sky-600",
    slate: "bg-slate-100 text-slate-600",
  };
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 rounded-xl px-2.5 py-2 text-sm
        text-ink-700 hover:bg-page active:bg-page transition-colors"
    >
      <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${tones[tone]}`}>
        <Icon className="h-4 w-4" />
      </span>
      <span className="flex-1 text-left truncate font-medium">{label}</span>
      {badge != null && (
        <span className="text-xs font-semibold text-ink-400 shrink-0">{badge}</span>
      )}
    </button>
  );
}

export default function BatchSidebar({
  batch,
  isTeacher,
  onOpen,
  upcomingExams = [],
  search,
  onSearch,
}) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <Link
        to={isTeacher ? "/teacher/batches" : "/student/batches"}
        className="flex items-center gap-1.5 px-3 py-2 text-xs text-ink-400
          hover:text-brand-600 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        {t("batches")}
      </Link>

      <div className="px-3">
        <p className="text-sm font-bold text-ink-900 leading-snug break-words">
          {batch.name}
        </p>
        {batch.subject && (
          <p className="mt-0.5 text-xs text-ink-400">{batch.subject}</p>
        )}
      </div>

      <div className="px-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2
            h-4 w-4 text-ink-400" />
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={t("searchPosts") || "খুঁজুন…"}
            className="w-full rounded-xl border border-line bg-page py-2.5 pl-9 pr-3
              text-sm outline-none focus:border-brand-500 focus:bg-surface
              placeholder:text-ink-400"
          />
        </div>
      </div>

      <div className="space-y-0.5 px-1">
        <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-ink-400">
          {t("manage") || "ব্যবস্থাপনা"}
        </p>

        {isTeacher && (
          <ToolButton icon={Users} tone="indigo" label={t("students")}
            badge={batch.student_count} onClick={() => onOpen("students")} />
        )}
        <ToolButton icon={ClipboardCheck} tone="emerald"
          label={isTeacher ? t("attendance") : t("myAttendance")}
          onClick={() => onOpen("attendance")} />
        <ToolButton icon={BarChart3} tone="violet" label={t("results")}
          onClick={() => onOpen("results")} />
        <ToolButton icon={Calendar} tone="sky" label={t("routine")}
          onClick={() => onOpen("routine")} />
        <ToolButton icon={Wallet} tone="amber"
          label={isTeacher ? t("fee") : t("myFee")} onClick={() => onOpen("fee")} />

        {isTeacher && (
          <>
            <ToolButton icon={UserPlus} tone="indigo" label={t("emailInvite")}
              onClick={() => onOpen("invite")} />
            <ToolButton icon={KeyRound} tone="slate" label={batch.invite_code}
              onClick={() => onOpen("code")} />
          </>
        )}
      </div>

      {upcomingExams.length > 0 && (
        <div className="px-3 pt-2">
          <div className="flex items-center gap-2 pb-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">
              {t("upcomingExams")}
            </p>
            <span className="flex h-1.5 w-1.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full
                rounded-full bg-warn opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-warn" />
            </span>
          </div>
          <ul className="space-y-2">
            {upcomingExams.map((p) => (
              <li key={p.id} className="rounded-xl border border-line p-2.5">
                <p className="text-xs font-semibold text-ink-700 leading-snug break-words">
                  {p.title}
                </p>
                <p className="mt-1 text-[11px] text-warn">
                  {formatDateTime(p.event_date)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
