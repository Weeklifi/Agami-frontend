import { useState } from "react";
import client from "../../api/client";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import RichTextEditor from "../../components/RichTextEditor";
import { POST_TYPES } from "../../lib/postTypes";

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
  const [form, setForm] = useState(EMPTY);
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const bodyText = plainText(form.body);
  const canSend = form.title.trim() || bodyText || file;

  const set = (key) => (e) =>
    setForm({
      ...form,
      [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    });

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0] || null;
    if (selectedFile) {
      setFile(selectedFile);
      if (selectedFile.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => setFilePreview(reader.result);
        reader.readAsDataURL(selectedFile);
      } else {
        setFilePreview(null);
      }
    } else {
      setFile(null);
      setFilePreview(null);
    }
  };

  const removeFile = () => {
    setFile(null);
    setFilePreview(null);
    const fileInput = document.getElementById("file-upload");
    if (fileInput) fileInput.value = "";
  };

  const doSubmit = async () => {
    if (!canSend || loading) return;
    setLoading(true);
    setErrors({});

    const finalTitle =
      form.title.trim() || bodyText.slice(0, 60) || POST_TYPES[form.post_type].label;

    const fd = new FormData();
    fd.append("post_type", form.post_type);
    fd.append("title", finalTitle);
    fd.append("body", form.body);
    fd.append("is_pinned", form.is_pinned);
    if (form.event_date) fd.append("event_date", form.event_date);
    if (form.link_url) fd.append("link_url", form.link_url);
    if (file) fd.append("attachment", file);

    try {
      // Content-Type header দিচ্ছি না — axios নিজে boundary সহ বসাবে
      await client.post(`/api/batches/${batchId}/posts/`, fd);

      setForm(EMPTY);
      setFile(null);
      setFilePreview(null);
      setExpanded(false);
      setResetKey((k) => k + 1);
      const fileInput = document.getElementById("file-upload");
      if (fileInput) fileInput.value = "";

      onPosted();
    } catch (err) {
      console.error("Upload error:", err);
      setErrors(err.response?.data || { detail: "Post করা যায়নি।" });
      setExpanded(true);
    } finally {
      setLoading(false);
    }
  };

  const isImageFile = file && file.type?.startsWith("image/");

  return (
    <div className="sticky bottom-14 md:bottom-0 -mx-4 md:-mx-6 border-t border-gray-200 bg-white px-4 py-4 md:px-6 shadow-lg">
      <div className="max-w-4xl mx-auto space-y-3">
        {/* Type chips */}
        <div className="flex items-center gap-2 flex-wrap">
          {Object.entries(POST_TYPES).map(([value, t]) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setForm({ ...form, post_type: value });
                setExpanded(true);
              }}
              className={`px-4 py-2 text-sm font-medium transition-all duration-200
                ${
                  form.post_type === value
                    ? "bg-gray-900 text-white border border-gray-900"
                    : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 hover:border-gray-400"
                }`}
            >
              {t.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="ml-auto px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 border border-gray-200 hover:border-gray-400 transition-colors"
          >
            {expanded ? "ছোট করুন ▾" : "লিখুন ▴"}
          </button>
        </div>

        {expanded ? (
          <div className="space-y-3">
            {form.post_type === "EXAM" && (
              <Input
                type="datetime-local"
                value={form.event_date}
                onChange={set("event_date")}
                error={errors.event_date?.[0]}
              />
            )}
            {form.post_type === "CONTENT" && (
              <Input
                type="url"
                placeholder="https:// — YouTube/Drive link"
                value={form.link_url}
                onChange={set("link_url")}
                error={errors.link_url?.[0]}
              />
            )}

            <RichTextEditor
              key={resetKey}
              value={form.body}
              onChange={(html) => setForm((f) => ({ ...f, body: html }))}
              onEnter={doSubmit}
              placeholder="এখানে লিখুন… (Enter = পাঠান, Shift+Enter = নতুন লাইন)"
            />

            {/* File Preview */}
            {filePreview && isImageFile && (
              <div className="border border-gray-200 overflow-hidden">
                <img src={filePreview} alt="Preview" className="max-h-64 w-auto object-contain" />
              </div>
            )}

            {file && !isImageFile && (
              <div className="flex items-center gap-3 border border-gray-200 bg-gray-50 px-4 py-3">
                <svg className="h-6 w-6 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <button type="button" onClick={removeFile} className="text-gray-400 hover:text-red-600 transition-colors">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            <div className="flex items-center gap-3 flex-wrap">
              <label className="inline-flex items-center gap-2 border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-50 hover:border-gray-400 transition-colors">
                <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                ফাইল/ছবি
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                />
              </label>

              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 ml-auto">
                <input
                  type="checkbox"
                  checked={form.is_pinned}
                  onChange={set("is_pinned")}
                  className="h-4 w-4 border-gray-300 text-gray-900 focus:ring-gray-900"
                />
                <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                পিন
              </label>
            </div>

            {errors.attachment && <p className="text-sm text-red-600">{errors.attachment[0]}</p>}
            {errors.title && <p className="text-sm text-red-600">{errors.title[0]}</p>}
            {errors.detail && <p className="text-sm text-red-600">{errors.detail}</p>}

            <div className="flex justify-end">
              <Button
                type="button"
                className="!w-auto px-8 py-2.5 text-sm font-semibold border border-gray-900 bg-gray-900 text-white hover:bg-gray-800 transition-colors"
                loading={loading}
                disabled={!canSend}
                onClick={doSubmit}
              >
                <span className="flex items-center gap-2">
                  পাঠান
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
              </Button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="w-full text-left border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500 hover:bg-gray-100 hover:border-gray-400 transition-colors"
          >
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.464z" />
              </svg>
              কিছু লিখুন…
            </span>
          </button>
        )}
      </div>
    </div>
  );
}