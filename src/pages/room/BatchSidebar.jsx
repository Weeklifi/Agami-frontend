import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { formatDateTime } from "../../lib/postTypes";

function ToolButton({ icon, label, badge, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm
        text-ink-600 hover:bg-page active:bg-page transition-colors"
    >
      <span className="text-ink-400 shrink-0">{icon}</span>
      <span className="flex-1 text-left truncate">{label}</span>
      {badge != null && (
        <span className="text-xs text-ink-400 shrink-0">{badge}</span>
      )}
    </button>
  );
}

const Icon = ({ d, filled = false }) => (
  <svg
    width="16" height="16" viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round"
  >
    <path d={d} />
  </svg>
);

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
      {/* Batch-এ ফেরার পথ */}
      <Link
        to={isTeacher ? "/teacher/batches" : "/student/batches"}
        className="flex items-center gap-2 px-3 py-2 text-xs text-ink-400
          hover:text-brand-600 transition-colors"
      >
        <Icon d="M15 18l-6-6 6-6" />
        {t("batches")}
      </Link>

      {/* Batch পরিচয় */}
      <div className="px-3">
        <p className="text-sm font-bold text-ink-900 leading-snug break-words">
          {batch.name}
        </p>
        {batch.subject && (
          <p className="mt-0.5 text-xs text-ink-400">{batch.subject}</p>
        )}
      </div>

      {/* খোঁজা */}
      <div className="px-3">
        <div className="relative">
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={t("searchPosts") || "খুঁজুন…"}
            className="w-full rounded-lg border border-line bg-page pl-8 pr-3 py-2
              text-sm outline-none focus:border-brand-500 focus:bg-surface
              placeholder:text-ink-400"
          />
          <span className="absolute left-2.5 top-2.5 text-ink-400">
            <Icon d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
          </span>
        </div>
      </div>

      {/* Tools */}
      <div className="space-y-0.5">
        <p className="px-3 pb-1 text-[11px] font-semibold uppercase
          tracking-wider text-ink-400">
          {t("manage") || "ব্যবস্থাপনা"}
        </p>

        {isTeacher && (
          <ToolButton
            icon={<Icon d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />}
            label={t("students")}
            badge={batch.student_count}
            onClick={() => onOpen("students")}
          />
        )}

        <ToolButton
          icon={<Icon d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />}
          label={isTeacher ? t("attendance") : t("myAttendance")}
          onClick={() => onOpen("attendance")}
        />

        <ToolButton
          icon={<Icon d="M8 21h8m-4-4v4m7-17H5a2 2 0 00-2 2v6a9 9 0 0018 0V4a2 2 0 00-2-2z" />}
          label={t("results")}
          onClick={() => onOpen("results")}
        />

        <ToolButton
          icon={<Icon d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />}
          label={t("routine")}
          onClick={() => onOpen("routine")}
        />

        <ToolButton
          icon={<Icon d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />}
          label={isTeacher ? t("fee") : t("myFee")}
          onClick={() => onOpen("fee")}
        />

        {isTeacher && (
          <>
            <ToolButton
              icon={<Icon d="M12 4v16m8-8H4" />}
              label={t("emailInvite")}
              onClick={() => onOpen("invite")}
            />
            <ToolButton
              icon={<Icon d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3" />}
              label={batch.invite_code}
              onClick={() => onOpen("code")}
            />
          </>
        )}
      </div>

      {/* আসন্ন পরীক্ষা */}
      {upcomingExams.length > 0 && (
        <div className="px-3 pt-2">
          <div className="flex items-center gap-2 pb-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider
              text-ink-400">
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
              <li key={p.id} className="rounded-lg border border-line p-2.5">
                <p className="text-xs font-semibold text-ink-700 leading-snug
                  break-words">
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