import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import client from "../api/client";
import { formatDateTime } from "../lib/postTypes";

export default function NotificationPanel({ open, onClose, onChanged }) {
  const navigate = useNavigate();
  const [items, setItems] = useState(null);

  const load = () =>
    client
      .get("/api/notifications/")
      .then((res) => setItems(res.data.results))
      .catch(() => setItems([]));

  useEffect(() => {
    if (open) {
      setItems(null); // reset — লোড হচ্ছে দেখাবে
      load();
    }
  }, [open]);

  if (!open) return null;

  const openItem = async (n) => {
    if (!n.is_read) {
      await client.post(`/api/notifications/${n.id}/read/`).catch(() => {});
      onChanged?.();
    }
    onClose();
    if (n.link) navigate(n.link);
  };

  const markAllRead = async () => {
    await client.post("/api/notifications/read-all/").catch(() => {});
    load();
    onChanged?.();
  };

  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div className="absolute inset-0 bg-ink-900/30" />

      <div
        className="absolute inset-y-0 right-0 w-full max-w-sm bg-surface
          shadow-xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-line">
          <h2 className="text-base font-bold">Notifications</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={markAllRead}
              className="text-xs text-brand-600 hover:underline"
            >
              সব পড়া হয়েছে ✓
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-ink-400 hover:bg-page"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* তালিকা */}
        <div className="flex-1 overflow-y-auto p-4">
          {items === null ? (
            <p className="text-sm text-ink-400 text-center py-8">লোড হচ্ছে…</p>
          ) : items.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-4xl mb-2">🔔</div>
              <p className="text-sm text-ink-400">কোনো notification নেই</p>
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((n) => (
                <button
                  key={n.id}
                  onClick={() => openItem(n)}
                  className={`w-full text-left rounded-xl border p-4 transition-colors
                    ${
                      n.is_read
                        ? "border-line bg-surface"
                        : "border-brand-100 bg-brand-50 hover:border-brand-500"
                    }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm ${n.is_read ? "" : "font-semibold"}`}>
                      {n.title}
                    </p>
                    {!n.is_read && (
                      <span className="mt-1 h-2 w-2 rounded-full bg-brand-600 shrink-0" />
                    )}
                  </div>
                  {n.body && (
                    <p className="mt-1 text-xs text-ink-600 leading-relaxed">
                      {n.body}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-ink-400">
                    {formatDateTime(n.created_at)}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}