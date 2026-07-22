import { useEffect, useRef } from "react";

const COLORS = ["#111827", "#dc2626", "#059669", "#4f46e5", "#d97706"];

export default function RichTextEditor({ value, onChange, onEnter, placeholder }) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current && !ref.current.innerHTML) {
      ref.current.innerHTML = value || "";
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleInput = (e) => {
    onChange(e.currentTarget.innerHTML);
  };

  const handleKeyDown = (e) => {
    // Enter → পাঠাও; Shift+Enter → নতুন লাইন (chat-এর অভ্যাস)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onEnter?.();
    }
  };

  const exec = (cmd, arg = null) => {
    ref.current.focus();
    document.execCommand(cmd, false, arg);
    onChange(ref.current.innerHTML);
  };

  return (
    <div className="rounded-lg border border-line focus-within:border-brand-500
      focus-within:ring-2 focus-within:ring-brand-100">
      <div className="flex items-center gap-1 border-b border-line px-2 py-1.5">
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => exec("bold")}
          className="w-7 h-7 rounded hover:bg-page font-bold text-sm">B</button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => exec("italic")}
          className="w-7 h-7 rounded hover:bg-page italic text-sm">I</button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => exec("underline")}
          className="w-7 h-7 rounded hover:bg-page underline text-sm">U</button>
        <span className="mx-1 h-4 w-px bg-line" />
        {COLORS.map((c) => (
          <button
            key={c}
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec("foreColor", c)}
            className="w-5 h-5 rounded-full border border-line"
            style={{ backgroundColor: c }}
            title="লেখার রঙ"
          />
        ))}
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        data-placeholder={placeholder}
        className="min-h-[70px] max-h-60 overflow-y-auto px-3.5 py-2.5 text-sm
          outline-none break-words whitespace-pre-wrap
          empty:before:content-[attr(data-placeholder)] empty:before:text-ink-400"
      />
    </div>
  );
}