import i18n from "../i18n/index.js";
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8001";

export const mediaUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path; // পুরো URL হলে যেমন আছে
  return `${API_URL}${path}`;                // /media/... → http://127.0.0.1:8001/media/...
};
export const getPostTypes = () => ({
  ANNOUNCEMENT: { label: i18n.t("announcement"), icon: "📢", tone: "bg-blue-50 text-blue-700" },
  EXAM:         { label: i18n.t("exam"),         icon: "📝", tone: "bg-amber-50 text-amber-700" },
  RESULT:       { label: i18n.t("result"),        icon: "🏆", tone: "bg-emerald-50 text-emerald-700" },
  CONTENT:      { label: i18n.t("content"),       icon: "📎", tone: "bg-gray-100 text-gray-700" },
});

// পুরনো POST_TYPES static export রেখে দাও — ভাঙবে না
export const POST_TYPES = {
  ANNOUNCEMENT: { label: "নোটিশ", icon: "📢", tone: "bg-blue-50 text-blue-700" },
  EXAM:         { label: "পরীক্ষা", icon: "📝", tone: "bg-amber-50 text-amber-700" },
  RESULT:       { label: "ফলাফল", icon: "🏆", tone: "bg-emerald-50 text-emerald-700" },
  CONTENT:      { label: "কন্টেন্ট", icon: "📎", tone: "bg-gray-100 text-gray-700" },
};

export const formatDateTime = (iso) =>
  new Date(iso).toLocaleString(
    i18n.language === "bn" ? "bn-BD" : "en-GB",
    { day: "numeric", month: "long", year: "numeric",
      hour: "numeric", minute: "2-digit" }
  );

export const isImageUrl = (url) =>
  /\.(jpe?g|png|gif|webp|svg)$/i.test(url);