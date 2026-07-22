export default function Modal({ open, onClose, title, children, wide = false }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-ink-900/40" />
      <div
        className={`relative w-full ${
          wide ? "sm:max-w-4xl" : "sm:max-w-md"
        } rounded-t-2xl sm:rounded-2xl border border-line bg-surface p-6
          max-h-[85vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold">{title}</h2>
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