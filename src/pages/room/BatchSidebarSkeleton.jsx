/** batch fetch হওয়ার আগ পর্যন্ত এটা দেখাই — নাহলে AppShell-এর
 * default main nav-এ ক্ষণিকের জন্য fallback করে flash তৈরি হয়। */
export default function BatchSidebarSkeleton() {
  return (
    <div className="animate-pulse space-y-4 px-3 pt-2">
      <div className="h-3.5 w-16 rounded bg-slate-100" />
      <div className="space-y-1.5">
        <div className="h-4 w-32 rounded bg-slate-100" />
        <div className="h-3 w-20 rounded bg-slate-100" />
      </div>
      <div className="space-y-1.5 pt-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-9 rounded-xl bg-slate-100" />
        ))}
      </div>
    </div>
  );
}
