import { useEffect, useState } from "react";
import client from "../api/client";
import NotificationPanel from "./NotificationPanel";

export default function NotificationBell() {
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);

  const fetchCount = () =>
    client
      .get("/api/notifications/unread-count/")
      .then((res) => setCount(res.data.unread))
      .catch(() => {});

  useEffect(() => {
    fetchCount();
    const timer = setInterval(fetchCount, 60_000); // প্রতি মিনিটে refresh
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-lg p-2 text-ink-600 hover:bg-page"
        aria-label="Notifications"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px]
            rounded-full bg-err text-white text-[10px] font-semibold
            flex items-center justify-center px-1">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </button>

      <NotificationPanel
        open={open}
        onClose={() => setOpen(false)}
        onChanged={fetchCount}
      />
    </>
  );
}