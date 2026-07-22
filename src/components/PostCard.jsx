import { useTranslation } from "react-i18next";
import Card from "./ui/Card";
import Avatar from "./ui/Avatar";
import { getPostTypes, formatDateTime, isImageUrl, mediaUrl } from "../lib/postTypes";

export default function PostCard({ post, canManage, onDelete }) {
  const { t } = useTranslation();

  const POST_TYPES = getPostTypes();
  const type = POST_TYPES[post.post_type] || POST_TYPES.ANNOUNCEMENT;

  const getFileExtension = (url) => {
    if (!url) return "";
    const filename = url.split("/").pop() || "";
    return filename.split(".").pop()?.toLowerCase() || "";
  };

  const getFileIcon = (url) => {
    const ext = getFileExtension(url);
    const iconMap = {
      pdf: "📄", doc: "📝", docx: "📝",
      xls: "📊", xlsx: "📊", ppt: "📊", pptx: "📊",
      txt: "📃", zip: "📦", rar: "📦",
      mp4: "🎬", mp3: "🎵", wav: "🎵",
    };
    return iconMap[ext] || "📎";
  };

  const getFileName = (url) => {
    if (!url) return "File";
    const filename = url.split("/").pop() || "";
    return filename || "Download";
  };

  return (
    <Card
      className={`!p-0 overflow-hidden w-full min-w-0 border ${
        post.is_pinned ? "border-gray-900 bg-gray-50/30" : "border-gray-200"
      } shadow-sm hover:shadow transition-all duration-200`}
    >
      {/* Header — ছোট, bold */}
      <div className="flex items-center gap-3 px-5 pt-4 pb-2.5 border-b border-gray-100">
        <Avatar name={post.author_name} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-gray-800 truncate">
            {post.author_name}
          </p>
          <p className="text-[11px] text-gray-500">
            {formatDateTime(post.created_at)}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 text-xs font-bold border ${
              post.post_type === "ANNOUNCEMENT"
                ? "bg-blue-50 text-blue-700 border-blue-200"
                : post.post_type === "EXAM"
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : post.post_type === "CONTENT"
                ? "bg-purple-50 text-purple-700 border-purple-200"
                : "bg-gray-50 text-gray-700 border-gray-200"
            }`}
          >
            {type.label}
          </span>
          {post.is_pinned && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold bg-gray-900 text-white border border-gray-900">
              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              পিন
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="px-5 pb-5 pt-4 min-w-0">
        {post.event_date && (
          <div className="inline-flex items-center gap-2 border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 mb-3">
            <svg className="h-4 w-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formatDateTime(post.event_date)}
          </div>
        )}

        {/* Message — বড়, পড়তে সহজ */}
        {post.body && (
          <div
            className="text-lg text-black-800 leading-relaxed
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
              <div className="border border-gray-200 overflow-hidden rounded-lg">
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
                className="flex items-center gap-4 border border-gray-200 px-4 py-3 hover:bg-gray-50 hover:border-gray-400 transition-colors group rounded-lg"
              >
                <span className="text-3xl flex-shrink-0">
                  {getFileIcon(post.attachment)}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {getFileName(post.attachment)}
                  </p>
                  <p className="text-xs text-gray-500">Click to download or view</p>
                </div>
                <svg className="h-5 w-5 text-gray-400 group-hover:text-gray-600 flex-shrink-0 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
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
            className="flex items-center gap-3 border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors mt-3 min-w-0 rounded-lg"
          >
            <svg className="h-5 w-5 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656-1.1 1.1" />
            </svg>
            <span className="truncate">{post.link_url}</span>
          </a>
        )}
      </div>

      {/* Footer — teacher only */}
      {canManage && (
        <div className="border-t border-gray-100 px-5 py-2.5 flex justify-end bg-gray-50/50">
          <button
            onClick={() => onDelete(post.id)}
            className="inline-flex items-center gap-2 text-xs font-medium text-gray-500 hover:text-red-600 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            {t("delete")}
          </button>
        </div>
      )}
    </Card>
  );
}