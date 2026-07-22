import { batchGradient } from "../lib/colors";

export default function BatchBanner({ batch }) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br
        ${batchGradient(batch.id)} px-5 py-8 md:px-8 md:py-12`}
    >
      {/* আলতো জ্যামিতিক অলংকরণ */}
      <div className="absolute -right-6 -top-8 h-32 w-32 rounded-full bg-white/10" />
      <div className="absolute right-14 -bottom-10 h-24 w-24 rounded-full bg-white/10" />

      <h1 className="relative text-xl md:text-3xl font-bold text-white">
        {batch.name}
      </h1>
      {batch.subject && (
        <p className="relative mt-1.5 text-sm md:text-base text-white/80">
          {batch.subject}
        </p>
      )}
      {batch.teacher_name && (
        <p className="relative mt-1 text-xs md:text-sm text-white/70">
          🎓 {batch.teacher_name}
        </p>
      )}
    </div>
  );
}