import { useState } from "react";
import { useTranslation } from "react-i18next";
import client from "../../api/client";
import RichTextEditor from "../../components/RichTextEditor";
import { getPostTypes } from "../../lib/postTypes";

const EMPTY = {
  post_type: "ANNOUNCEMENT",
  title: "",
  body: "",
  event_date: "",
  link_url: "",
  is_pinned: false,
};

const plainText = (html) => {
  const div = document.createElement("div");
  div.innerHTML = html || "";
  return (div.textContent || "").trim();
};

export default function Composer({ batchId, onPosted }) {
  const { t } = useTranslation();
  const POST_TYPES = getPostTypes();

  const [form, setForm] = useState(EMPTY);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const bodyText = plainText(form.body);
  const canSend = form.title.trim() || bodyText || file;
  const isImage = file?.type?.startsWith("image/");

  const set = (k) => (e) =>
    setForm({
      ...form,
      [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    });

  const pickFile = (e) => {
    const f = e.target.files[0] || null;
    setFile(f);
    if (f?.type.startsWith("image/")) {
      const r = new FileReader();
      r.onloadend = () => setPreview(r.result);
      r.readAsDataURL(f);
    } else setPreview(null);
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    const el = document.getElementById("composer-file");
    if (el) el.value = "";
  };

  const submit = async () => {
    if (!canSend || loading) return;
    setLoading(true);
    setErrors({});

    const fd = new FormData();
    fd.append("post_type", form.post_type);
    fd.append(
      "title",
      form.title.trim() || bodyText.slice(0, 60) || POST_TYPES[form.post_type].label
    );
    fd.append("body", form.body);
    fd.append("is_pinned", form.is_pinned);
    if (form.event_date) fd.append("event_date", form.event_date);
    if (form.link_url) fd.append("link_url", form.link_url);
    if (file) fd.append("attachment", file);

    try {
      await client.post(`/api/batches/${batchId}/posts/`, fd);
      setForm(EMPTY);
      clearFile();
      setOpen(false);
      setResetKey((k) => k + 1);
      onPosted();
    } catch (err) {
      setErrors(err.response?.data || { detail: "Post করা যায়নি।" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sticky bottom-14 md:bottom-0 -mx-3 md:-mx-6 border-t
      border-line bg-surface/95 backdrop-blur px-3 py-3 md:px-6 safe-bottom">
      <div className="max-w-2xl mx-auto">
        {!open ? (
          <button
            onClick={() => setOpen(true)}
            className="w-full flex items-center gap-2.5 rounded-full border
              border-line bg-page px-4 py-2.5 text-sm text-ink-400
              hover:bg-surface hover:border-ink-300 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M12 20h9M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
            {t("newPost")}
          </button>
        ) : (
          <div className="space-y-2.5">
            {/* Type chips — ছোট, পরিষ্কার */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {Object.entries(POST_TYPES).map(([value, cfg]) => (
                <button
                  key={value}
                  onClick={() => setForm({ ...form, post_type: value })}
                  className={`rounded-md px-2.5 py-1 text-[11px] font-medium
                    border transition-colors
                    ${form.post_type === value
                      ? "border-ink-900 bg-ink-900 text-white"
                      : "border-line text-ink-500 hover:border-ink-400 hover:text-ink-700"
                    }`}
                >
                  {cfg.label}
                </button>
              ))}
              <button
                onClick={() => setOpen(false)}
                className="ml-auto p-1 text-ink-400 hover:text-ink-600"
                aria-label="Close"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {form.post_type === "EXAM" && (
              <input
                type="datetime-local"
                value={form.event_date}
                onChange={set("event_date")}
                className="w-full rounded-lg border border-line px-3 py-2 text-sm
                  outline-none focus:border-brand-500"
              />
            )}
            {form.post_type === "CONTENT" && (
              <input
                type="url"
                placeholder="https:// — YouTube / Drive link"
                value={form.link_url}
                onChange={set("link_url")}
                className="w-full rounded-lg border border-line px-3 py-2 text-sm
                  outline-none focus:border-brand-500"
              />
            )}

            <RichTextEditor
              key={resetKey}
              value={form.body}
              onChange={(html) => setForm((f) => ({ ...f, body: html }))}
              onEnter={submit}
              placeholder={t("writeHere") || "এখানে লিখুন…"}
            />

            {preview && (
              <div className="relative inline-block">
                <img src={preview} alt="" className="max-h-40 rounded-lg border border-line" />
                <button
                  onClick={clearFile}
                  className="absolute -top-2 -right-2 rounded-full bg-ink-900
                    text-white w-6 h-6 flex items-center justify-center text-xs"
                >
                  ✕
                </button>
              </div>
            )}
            {file && !isImage && (
              <div className="flex items-center gap-2 rounded-lg bg-page px-3 py-2">
                <span className="text-sm">📎</span>
                <span className="flex-1 text-xs truncate">{file.name}</span>
                <button onClick={clearFile} className="text-ink-400 text-xs">✕</button>
              </div>
            )}

            {Object.values(errors).map((e, i) => (
              <p key={i} className="text-xs text-err">
                {Array.isArray(e) ? e[0] : e}
              </p>
            ))}

            {/* নিচের সারি */}
            <div className="flex items-center gap-1">
              <label className="p-2 rounded-lg text-ink-400 hover:bg-page
                hover:text-ink-600 cursor-pointer transition-colors"
                title={t("attachFile")}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
                </svg>
                <input id="composer-file" type="file" className="hidden"
                  onChange={pickFile}
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt" />
              </label>

              <button
                onClick={() => setForm({ ...form, is_pinned: !form.is_pinned })}
                className={`p-2 rounded-lg transition-colors
                  ${form.is_pinned
                    ? "bg-brand-50 text-brand-600"
                    : "text-ink-400 hover:bg-page hover:text-ink-600"}`}
                title={t("pin")}
              >
                <svg width="18" height="18" viewBox="0 0 24 24"
                  fill={form.is_pinned ? "currentColor" : "none"}
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </button>

              <button
                onClick={submit}
                disabled={!canSend || loading}
                className="ml-auto inline-flex items-center gap-1.5 rounded-lg
                  bg-ink-900 px-4 py-2 text-sm font-medium text-white
                  disabled:opacity-40 disabled:cursor-not-allowed
                  hover:bg-ink-800 transition-colors"
              >
                {loading ? "…" : t("send")}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}