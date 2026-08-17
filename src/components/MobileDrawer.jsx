export default function MobileDrawer({ open, onClose, children }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden" onClick={onClose}>
      <div className="absolute inset-0 bg-ink-900/40" />
      <div
        className="absolute inset-y-0 left-0 flex h-full w-72 max-w-[80vw] flex-col
          bg-surface shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-line">
          <span className="flex items-center gap-2.5">
            <span className="grad-brand shadow-brand grid h-9 w-9 place-items-center
              rounded-xl text-lg font-extrabold text-white">অ</span>
            <span className="text-lg font-bold text-ink-900">Agami</span>
          </span>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-ink-400 hover:bg-page"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}