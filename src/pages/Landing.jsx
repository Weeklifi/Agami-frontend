import { Link } from "react-router-dom";
import {
  Users, ClipboardCheck, BarChart3, Calendar, Wallet, UserPlus,
  MessageSquare, Languages, ArrowRight, Sparkles, ShieldCheck, Video,
  Check, GraduationCap,
} from "lucide-react";

const FEATURES = [
  { icon: Users, tone: "bg-brand-50 text-brand-600",
    title: "Batch Room", desc: "প্রতিটি ব্যাচের জন্য আলাদা ক্লাসরুম — নোটিশ, পরীক্ষা, ইভেন্ট সব একসাথে।" },
  { icon: ClipboardCheck, tone: "bg-emerald-50 text-ok",
    title: "উপস্থিতি", desc: "এক ট্যাপে পুরো ব্যাচের attendance নেওয়া যায়, সাথে মাসিক রিপোর্ট।" },
  { icon: BarChart3, tone: "bg-violet-50 text-violet-600",
    title: "ফলাফল ও লিডারবোর্ড", desc: "পরীক্ষার নম্বর প্রকাশ করলেই শিক্ষার্থীরা নিজেদের র‍্যাংক দেখতে পারবে।" },
  { icon: Calendar, tone: "bg-sky-50 text-sky-600",
    title: "ক্লাস রুটিন", desc: "সাপ্তাহিক রুটিন এক জায়গায় — শিক্ষক আপডেট করলেই সবাই সাথে সাথে দেখবে।" },
  { icon: Wallet, tone: "bg-amber-50 text-warn",
    title: "বেতন আদায়", desc: "মাসিক বেতনের হিসাব, বাকি-পরিশোধ ট্র্যাকিং — এক নজরে কে বাকি রেখেছে।" },
  { icon: UserPlus, tone: "bg-rose-50 text-err",
    title: "Invite Code ও Email", desc: "কোড শেয়ার করে অথবা email পাঠিয়ে এক ক্লিকে শিক্ষার্থী যোগ করা যায়।" },
  { icon: MessageSquare, tone: "bg-brand-50 text-brand-600",
    title: "Bulk SMS", desc: "অভিভাবকদের কাছে সরাসরি SMS পাঠানোর ব্যবস্থা রয়েছে।" },
  { icon: Languages, tone: "bg-slate-100 text-slate-600",
    title: "বাংলা + English", desc: "পুরো অ্যাপ বাংলায় ব্যবহার করা যায়, প্রয়োজনে English-ও আছে।" },
];

const UPCOMING = [
  { icon: Video, title: "মেসেজিং ও ভিডিও কল",
    desc: "চ্যাট, ইমোজি, অডিও-ভিডিও কল আর স্ক্রিন শেয়ারিং দিয়ে শিক্ষক-শিক্ষার্থী সরাসরি যোগাযোগ করতে পারবে।" },
  { icon: ShieldCheck, title: "প্রক্টরড অনলাইন পরীক্ষা",
    desc: "ফুলস্ক্রিন লক, ক্যামেরা-মাইক পর্যবেক্ষণসহ MCQ ও লিখিত — দুই ধরনের পরীক্ষাই নেওয়া যাবে।" },
  { icon: Sparkles, title: "AI দিয়ে প্রশ্ন তৈরি",
    desc: "শিক্ষকের আপলোড করা পড়ার ম্যাটেরিয়াল থেকে AI স্বয়ংক্রিয়ভাবে প্রশ্ন তৈরি করে দেবে।" },
];

function BrowserFrame({ children, url }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-pop">
      <div className="flex items-center gap-1.5 border-b border-line bg-page px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-red-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
        {url && (
          <span className="ml-2 truncate rounded-md bg-surface px-2 py-0.5 text-[10px]
            text-ink-400 border border-line">{url}</span>
        )}
      </div>
      <div className="p-3">{children}</div>
    </div>
  );
}

function MockBatchFeed() {
  return (
    <BrowserFrame url="agami.app/batches/chem">
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br
        from-fuchsia-600 to-pink-500 px-4 py-5">
        <div className="absolute -right-4 -top-6 h-20 w-20 rounded-full bg-white/10" />
        <h3 className="relative text-base font-bold text-white">Chem</h3>
        <p className="relative mt-0.5 flex items-center gap-1 text-[11px] text-white/80">
          <GraduationCap className="h-3 w-3" /> Rafid Bin Bakhtiar
        </p>
      </div>
      <div className="mt-2.5 rounded-xl border border-line bg-surface p-3">
        <div className="flex items-center gap-2">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-brand-600
            text-[10px] font-bold text-white">R</span>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold">Rafid Bin Bakhtiar</p>
            <p className="text-[10px] text-ink-400">১৮ আগস্ট, ২০২৬</p>
          </div>
        </div>
        <p className="mt-2 text-xs text-ink-600">Hello</p>
      </div>
    </BrowserFrame>
  );
}

function MockAttendance() {
  return (
    <BrowserFrame url="agami.app/batches/chem/attendance">
      <p className="text-xs font-bold">উপস্থিতি</p>
      <div className="mt-2 grid grid-cols-4 gap-1.5">
        {[["0", "উপস্থিত", "text-ok"], ["0", "অনুপস্থিত", "text-err"],
          ["1", "বাকি", "text-warn"], ["1", "মোট", "text-ink-900"]].map(([n, l, c]) => (
          <div key={l} className="rounded-lg border border-line py-1.5 text-center">
            <p className={`text-sm font-bold ${c}`}>{n}</p>
            <p className="text-[9px] text-ink-400">{l}</p>
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center justify-between rounded-lg border
        border-line px-2.5 py-1.5">
        <span className="flex items-center gap-1.5 text-[11px] font-medium">
          <span className="grid h-5 w-5 place-items-center rounded-full bg-sky-500
            text-[9px] font-bold text-white">R</span> Rafid Bin
        </span>
        <Check className="h-3.5 w-3.5 text-ok" />
      </div>
    </BrowserFrame>
  );
}

function MockFee() {
  return (
    <BrowserFrame url="agami.app/batches/chem/adai">
      <p className="text-xs font-bold">আদায়</p>
      <p className="mt-1 text-[11px] text-ink-500">মাসিক বেতন: <b className="text-ink-900">৳1000.00</b></p>
      <div className="mt-2 flex items-center justify-between rounded-lg border
        border-line px-2.5 py-1.5">
        <span className="flex items-center gap-1.5 text-[11px] font-medium">
          <span className="grid h-5 w-5 place-items-center rounded-full bg-sky-500
            text-[9px] font-bold text-white">R</span> Rafid Bin
        </span>
        <span className="rounded-full bg-red-50 px-2 py-0.5 text-[9px] font-semibold
          text-err">বাকি</span>
      </div>
    </BrowserFrame>
  );
}

function MockRoutine() {
  return (
    <BrowserFrame url="agami.app/batches/chem/routine">
      <p className="text-xs font-bold">Class Routine</p>
      <div className="mt-2 space-y-1.5">
        <div className="rounded-lg border border-line px-2.5 py-1.5">
          <p className="text-[11px] font-semibold">রবিবার</p>
          <p className="text-[10px] text-ink-400">সকাল ৯:০০ – ১০:৩০ · Room 2</p>
        </div>
        <div className="rounded-lg border border-line px-2.5 py-1.5">
          <p className="text-[11px] font-semibold">মঙ্গলবার</p>
          <p className="text-[10px] text-ink-400">বিকাল ৪:০০ – ৫:৩০ · Google Meet</p>
        </div>
      </div>
    </BrowserFrame>
  );
}

export default function Landing() {
  return (
    <div className="min-h-dvh bg-page">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-line bg-surface/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
          <div className="flex items-center gap-2.5">
            <div className="grad-brand shadow-brand grid h-9 w-9 place-items-center
              rounded-xl text-lg font-extrabold text-white">অ</div>
            <span className="text-lg font-bold text-ink-900">Agami</span>
          </div>
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 rounded-xl grad-brand
              px-4 py-2.5 text-sm font-semibold text-white shadow-brand
              hover:brightness-105 transition"
          >
            Login <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden
        bg-[radial-gradient(1000px_500px_at_50%_-10%,#eef2ff_0%,transparent_60%)]">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14
          md:grid-cols-2 md:py-20 md:px-6">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50
              px-3 py-1 text-xs font-semibold text-brand-700">
              <Sparkles className="h-3.5 w-3.5" /> কোচিং সেন্টার ম্যানেজমেন্ট
            </span>
            <h1 className="mt-4 text-3xl font-extrabold leading-tight text-ink-900
              md:text-5xl">
              আপনার কোচিং,<br /> এক জায়গায় সাজানো
            </h1>
            <p className="mt-4 max-w-md text-sm text-ink-600 md:text-base">
              Batch তৈরি, উপস্থিতি, ফলাফল, রুটিন আর বেতন আদায় — শিক্ষক ও
              শিক্ষার্থী উভয়ের জন্য একটিমাত্র সহজ ডিজিটাল ক্লাসরুম।
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-xl grad-brand
                  px-6 py-3.5 text-sm font-semibold text-white shadow-brand
                  hover:brightness-105 transition"
              >
                শুরু করুন <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/register"
                className="text-sm font-medium text-brand-600 hover:underline"
              >
                নতুন? Account তৈরি করুন
              </Link>
            </div>
          </div>
          <div className="mx-auto w-full max-w-xs md:max-w-sm">
            <MockBatchFeed />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-20">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-extrabold text-ink-900 md:text-3xl">
            যা যা করতে পারবেন
          </h2>
          <p className="mt-2 text-sm text-ink-600">
            কোচিং পরিচালনার প্রতিটি ধাপ, একটি অ্যাপেই
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="rounded-2xl border border-line bg-surface
                p-5 shadow-soft">
                <div className={`mb-3 grid h-11 w-11 place-items-center rounded-2xl ${f.tone}`}>
                  <Icon className="h-5 w-5" strokeWidth={2} />
                </div>
                <h3 className="text-sm font-bold text-ink-900">{f.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-ink-600">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Screenshots */}
      <section id="screenshots" className="bg-surface border-y border-line">
        <div className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-20">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-extrabold text-ink-900 md:text-3xl">
              সরাসরি দেখুন
            </h2>
            <p className="mt-2 text-sm text-ink-600">
              আসল অ্যাপ থেকে — শিক্ষক প্রতিদিন যা ব্যবহার করেন
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <MockAttendance />
            <MockFee />
            <MockRoutine />
          </div>
        </div>
      </section>

      {/* Upcoming features */}
      <section id="upcoming" className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-20">
        <div className="mb-10 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50
            px-3 py-1 text-xs font-semibold text-warn">
            <Sparkles className="h-3.5 w-3.5" /> রোডম্যাপ
          </span>
          <h2 className="mt-3 text-2xl font-extrabold text-ink-900 md:text-3xl">
            আসছে শীঘ্রই
          </h2>
          <p className="mt-2 text-sm text-ink-600">
            যে ফিচারগুলো নিয়ে আমরা এখন কাজ করছি
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {UPCOMING.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="relative rounded-2xl border-2 border-dashed
                border-line bg-surface/60 p-5">
                <span className="absolute right-4 top-4 rounded-full bg-amber-50
                  px-2 py-0.5 text-[10px] font-semibold text-warn">Coming soon</span>
                <div className="mb-3 grid h-11 w-11 place-items-center rounded-2xl
                  bg-page text-ink-600">
                  <Icon className="h-5 w-5" strokeWidth={2} />
                </div>
                <h3 className="text-sm font-bold text-ink-900">{f.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-ink-600">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA banner */}
      <section className="mx-auto max-w-6xl px-4 pb-14 md:px-6 md:pb-20">
        <div className="relative overflow-hidden rounded-2xl grad-brand px-6 py-12
          text-center shadow-brand">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40
            rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -left-10 -bottom-10 h-40 w-40
            rounded-full bg-white/10" />
          <h2 className="relative text-xl font-extrabold text-white md:text-2xl">
            আজই শুরু করুন — সম্পূর্ণ বিনামূল্যে
          </h2>
          <p className="relative mx-auto mt-2 max-w-md text-sm text-white/85">
            শিক্ষক বা শিক্ষার্থী, দুই ভূমিকাতেই Agami ব্যবহার শুরু করা যায় কয়েক মিনিটেই।
          </p>
          <Link
            to="/login"
            className="relative mt-6 inline-flex items-center gap-2 rounded-xl
              bg-white px-6 py-3.5 text-sm font-semibold text-brand-700
              shadow-pop hover:brightness-95 transition"
          >
            শুরু করুন <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-line px-4 py-8 md:px-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between
          gap-3 text-center sm:flex-row sm:text-left">
          <div className="flex items-center gap-2">
            <div className="grad-brand grid h-7 w-7 place-items-center rounded-lg
              text-sm font-extrabold text-white">অ</div>
            <span className="text-sm font-bold text-ink-900">Agami</span>
          </div>
          <p className="text-xs text-ink-400">
            © {new Date().getFullYear()} Agami — সব অধিকার সংরক্ষিত।
          </p>
        </div>
      </footer>
    </div>
  );
}
