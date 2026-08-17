const tones = {
  indigo: "bg-brand-50 text-brand-600",
  violet: "bg-violet-50 text-violet-600",
  emerald: "bg-emerald-50 text-ok",
  amber: "bg-amber-50 text-warn",
  rose: "bg-red-50 text-err",
  sky: "bg-sky-50 text-sky-600",
  slate: "bg-slate-100 text-slate-600",
};

const sizes = {
  sm: "h-9 w-9 rounded-[10px]",
  md: "h-10 w-10 rounded-xl",
  lg: "h-12 w-12 rounded-2xl",
};

/** রঙিন rounded-square-এ একটি lucide আইকন — লিস্ট/টাইল জুড়ে reuse হয়। */
export default function IconTile({ icon: Icon, tone = "indigo", size = "md", className = "" }) {
  return (
    <div className={`${sizes[size]} ${tones[tone]} grid place-items-center shrink-0 ${className}`}>
      <Icon className={size === "lg" ? "h-6 w-6" : "h-5 w-5"} strokeWidth={2} />
    </div>
  );
}
