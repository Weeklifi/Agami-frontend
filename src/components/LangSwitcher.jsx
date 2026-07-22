import { useTranslation } from "react-i18next";

export default function LangSwitcher() {
  const { i18n } = useTranslation();
  const isBn = i18n.language === "bn";

  const toggle = () => {
    const next = isBn ? "en" : "bn";
    i18n.changeLanguage(next);
    localStorage.setItem("lang", next);
  };

  return (
    <button
      onClick={toggle}
      className="rounded-full border border-line bg-surface px-3 py-1.5
        text-xs font-medium text-ink-600 hover:border-brand-500
        hover:text-brand-600 transition-colors"
      title="ভাষা পরিবর্তন / Change Language"
    >
      {isBn ? "EN" : "বাং"}
    </button>
  );
}