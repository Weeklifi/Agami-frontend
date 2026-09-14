import { useEffect } from "react";

export default function Modal({ open, onClose, title, wide = false, size, children }) {
  // size: "xl" → চওড়া table-এর জন্য; নাহলে wide=2xl, default=md
  const maxWidth =
    size === "xl" ? "sm:max-w-5xl" : wide ? "sm:max-w-2xl" : "sm:max-w-md";
  // Modal খোলা থাকলে পেছনের page scroll বন্ধ — নাহলে মোবাইলে
  // modal scroll করতে গিয়ে পেছনের page নড়ে, খুব বিরক্তিকর
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center
      justify-center sm:p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-ink-900/50" />

      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full bg-surface
          rounded-t-2xl sm:rounded-2xl
          max-h-[88dvh] sm:max-h-[85dvh] flex flex-col
          ${maxWidth}`}
      >
        {/* মোবাইলে টানার handle — bottom sheet বোঝাতে */}
        <div className="sm:hidden flex justify-center pt-2.5 pb-1">
          <div className="h-1 w-10 rounded-full bg-line" />
        </div>

        <div className="flex items-center justify-between gap-3 px-5 py-3
          border-b border-line shrink-0">
          <h2 className="text-base font-semibold truncate">{title}</h2>
          <button
            onClick={onClose}
            className="-mr-1 p-2 rounded-lg text-ink-400 active:bg-page"
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* এই অংশটাই scroll হবে — modal নিজে না */}
        <div
          className="flex-1 overflow-y-auto overscroll-contain px-5 pt-4"
          style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom, 0px))" }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}