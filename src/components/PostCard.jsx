import { useTranslation } from "react-i18next";
import { Calendar, Download, Link2, Trash2, Pin, FileText } from "lucide-react";
import Card from "./ui/Card";
import Avatar from "./ui/Avatar";
import { getPostTypes, formatDateTime, isImageUrl, mediaUrl } from "../lib/postTypes";

const typeTone = {
  ANNOUNCEMENT: "bg-brand-50 text-brand-600",
  EXAM: "bg-amber-50 text-warn",
  CONTENT: "bg-violet-50 text-violet-600",
};

export default function PostCard({ post, canManage, onDelete }) {
  const { t } = useTranslation();

  const POST_TYPES = getPostTypes();
  const type = POST_TYPES[post.post_type] || POST_TYPES.ANNOUNCEMENT;

  const getFileName = (url) => {
    if (!url) return "File";
    return url.split("/").pop() || "Download";
  };

  return (
    <Card
      className={`!p-0 overflow-hidden w-full min-w-0
        ${post.is_pinned ? "border-brand-200 bg-brand-50/30" : ""}`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-3.5 pb-2.5 border-b border-line">
        <Avatar name={post.author_name} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-ink-900 truncate">{post.author_name}</p>
          <p className="text-[11px] text-ink-400">{formatDateTime(post.created_at)}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold
            ${typeTone[post.post_type] || "bg-slate-100 text-slate-600"}`}>
            {type.label}
          </span>
          {post.is_pinned && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50
              px-2 py-0.5 text-[11px] font-semibold text-warn">
              <Pin className="h-3 w-3" /> পিন
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="px-4 pb-4 pt-3 min-w-0">
        {post.event_date && (
          <div className="mb-3 inline-flex items-center gap-2 rounded-xl border border-amber-200
            bg-amber-50 px-3 py-1.5 text-sm font-semibold text-warn">
            <Calendar className="h-4 w-4" />
            {formatDateTime(post.event_date)}
          </div>
        )}

        {post.body && (
          <div
            className="text-[15px] text-ink-900 leading-relaxed
              break-words whitespace-normal [overflow-wrap:anywhere] min-w-0
              [&_span]:inline
              [&_b]:font-bold [&_strong]:font-bold
              [&_i]:italic [&_em]:italic
              [&_u]:underline
              [&_s]:line-through
              [&_p]:my-2
              [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-2
              [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-2
              [&_li]:my-1"
            dangerouslySetInnerHTML={{ __html: post.body }}
          />
        )}

        {/* Attachment */}
        {post.attachment && (
          <div className="mt-3">
            {isImageUrl(post.attachment) ? (
              <div className="overflow-hidden rounded-xl border border-line">
                <img
                  src={mediaUrl(post.attachment)}
                  alt={post.title || "Attachment"}
                  className="max-h-96 w-auto object-contain"
                />
              </div>
            ) : (
              <a
                href={mediaUrl(post.attachment)}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 rounded-xl border border-line
                  px-4 py-3 hover:bg-page transition-colors"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl
                  bg-brand-50 text-brand-600">
                  <FileText className="h-5 w-5" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-semibold text-ink-900">
                    {getFileName(post.attachment)}
                  </p>
                  <p className="text-xs text-ink-400">ডাউনলোড / দেখুন</p>
                </div>
                <Download className="h-5 w-5 shrink-0 text-ink-400 group-hover:text-brand-600" />
              </a>
            )}
          </div>
        )}

        {/* Link */}
        {post.link_url && (
          <a
            href={post.link_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center gap-3 rounded-xl border border-line px-4 py-3
              text-sm font-medium text-ink-700 hover:bg-page transition-colors min-w-0"
          >
            <Link2 className="h-5 w-5 shrink-0 text-ink-400" />
            <span className="truncate">{post.link_url}</span>
          </a>
        )}
      </div>

      {/* Footer — teacher only */}
      {canManage && (
        <div className="flex justify-end border-t border-line bg-page/50 px-4 py-2">
          <button
            onClick={() => onDelete(post.id)}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-400
              hover:text-err transition-colors"
          >
            <Trash2 className="h-4 w-4" /> {t("delete")}
          </button>
        </div>
      )}
    </Card>
  );
}
