
// import { useCallback, useEffect, useMemo, useState } from "react";
// import { Link, useLocation, useParams } from "react-router-dom";
// import { useTranslation } from "react-i18next";
// import {
//   ChevronLeft, Search, UserPlus, Pencil, Eye, MessageSquare, Users,
// } from "lucide-react";
// import client from "../../api/client";
// import AppShell from "../../components/AppShell";
// import Avatar from "../../components/ui/Avatar";
// import Badge from "../../components/ui/Badge";
// import InviteModal from "./InviteModal";
// import BatchSidebar from "../room/BatchSidebar";
// import BatchSidebarSkeleton from "../room/BatchSidebarSkeleton";
// import BatchModals from "../room/BatchModals";

// const PAGE_SIZE = 10;

// function isThisMonth(dateStr) {
//   if (!dateStr) return false;
//   const d = new Date(dateStr);
//   const now = new Date();
//   return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
// }

// function fmtDate(dateStr) {
//   if (!dateStr) return "—";
//   return new Date(dateStr).toLocaleDateString("en-GB", {
//     day: "2-digit", month: "short", year: "numeric",
//   });
// }

// function ActionIcon({ title, tone = "ink", children }) {
//   const tones = {
//     ink: "text-ink-400 hover:text-brand-600 hover:bg-brand-50",
//     danger: "text-ink-400 hover:text-err hover:bg-red-50",
//   };
//   return (
//     <button type="button" title={title}
//       className={`grid h-8 w-8 place-items-center rounded-lg border border-line
//         transition-colors ${tones[tone]}`}>
//       {children}
//     </button>
//   );
// }

// export default function StudentListPage() {
//   const { id } = useParams();
//   const location = useLocation();
//   const { t } = useTranslation();

//   // navigate() থেকে batch data সাথেই এলে সেটাই প্রথমে দেখাই —
//   // নাহলে fetch শেষ না হওয়া পর্যন্ত sidebar skeleton দেখাবে
//   const [batch, setBatch] = useState(location.state?.batch ?? null);
//   const [students, setStudents] = useState(null);
//   const [status, setStatus] = useState("all");
//   const [query, setQuery] = useState("");
//   const [page, setPage] = useState(1);
//   const [inviteOpen, setInviteOpen] = useState(false);
//   const [tool, setTool] = useState(null);

//   useEffect(() => {
//     client.get(`/api/batches/${id}/`).then((res) => setBatch(res.data)).catch(() => {});
//   }, [id]);

//   const loadStudents = useCallback(() => {
//     client
//       .get(`/api/batches/${id}/students/`)
//       .then((res) => setStudents(res.data))
//       .catch(() => setStudents([]));
//   }, [id]);

//   useEffect(loadStudents, [loadStudents]);

//   // filter + search
//   const rows = useMemo(() => {
//     const list = students || [];
//     const q = query.trim().toLowerCase();
//     return list.filter((s) => {
//       if (status === "active" && !s.is_active) return false;
//       if (status === "inactive" && s.is_active) return false;
//       if (status === "new" && !isThisMonth(s.joined_at)) return false;
//       if (!q) return true;
//       return [s.student_name, s.student_email, s.student_phone, s.guardian_name, s.guardian_phone]
//         .filter(Boolean)
//         .some((v) => String(v).toLowerCase().includes(q));
//     });
//   }, [students, status, query]);

//   // filter বদলালে প্রথম page-এ ফিরি
//   useEffect(() => { setPage(1); }, [status, query]);

//   const total = rows.length;
//   const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
//   const current = Math.min(page, totalPages);
//   const start = (current - 1) * PAGE_SIZE;
//   const pageRows = rows.slice(start, start + PAGE_SIZE);

//   return (
//     <AppShell
//       title={t("students") || "Students"}
//       sidebar={
//         batch ? (
//           <BatchSidebar
//             batch={batch}
//             isTeacher
//             upcomingExams={[]}
//             onOpen={(key) => (key === "invite" ? setInviteOpen(true) : setTool(key))}
//           />
//         ) : (
//           <BatchSidebarSkeleton />
//         )
//       }
//     >
//       {/* Breadcrumb */}
//       <div className="mb-4 flex items-center gap-2 text-sm text-ink-400">
//         <Link to={`/teacher/batches/${id}`} state={{ batch }}
//           className="flex items-center gap-1 hover:text-brand-600 transition-colors">
//           <ChevronLeft className="h-4 w-4" />
//           {batch ? batch.name : t("batches")}
//         </Link>
//         <span>/</span>
//         <span className="font-medium text-ink-600">{t("students") || "Student List"}</span>
//       </div>

//       {/* Title + action */}
//       <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
//         <div>
//           <h2 className="text-2xl font-bold text-ink-900">
//             {t("studentList") || "Student List"}
//           </h2>
//           {batch && (
//             <p className="mt-0.5 text-sm text-ink-400">
//               {batch.name}{batch.subject ? ` · ${batch.subject}` : ""}
//             </p>
//           )}
//         </div>
//         <button
//           onClick={() => setInviteOpen(true)}
//           className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5
//             text-sm font-semibold text-white shadow-sm hover:bg-brand-700 transition-colors"
//         >
//           <UserPlus className="h-4 w-4" />
//           {t("inviteStudents") || "Invite Student"}
//         </button>
//       </div>

//       {/* Filter row */}
//       <div className="mb-4 grid grid-cols-1 gap-3 rounded-2xl border border-line
//         bg-surface p-4 sm:grid-cols-[200px_1fr]">
//         <div>
//           <label className="mb-1.5 block text-xs font-semibold text-ink-600">
//             {t("status") || "Status"} <span className="text-ink-400">({t("statusBn") || "অবস্থা"})</span>
//           </label>
//           <select
//             value={status}
//             onChange={(e) => setStatus(e.target.value)}
//             className="w-full rounded-xl border border-line bg-page px-3 py-2.5 text-sm
//               outline-none focus:border-brand-500 focus:bg-surface"
//           >
//             <option value="all">{t("allStudents") || "All students"}</option>
//             <option value="active">{t("active") || "Active"}</option>
//             <option value="inactive">{t("inactive") || "Inactive"}</option>
//             <option value="new">{t("newThisMonth") || "New this month"}</option>
//           </select>
//         </div>
//         <div>
//           <label className="mb-1.5 block text-xs font-semibold text-ink-600">
//             {t("search") || "Search"} <span className="text-ink-400">({t("searchBn") || "খুঁজুন"})</span>
//           </label>
//           <div className="relative">
//             <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2
//               h-4 w-4 text-ink-400" />
//             <input
//               value={query}
//               onChange={(e) => setQuery(e.target.value)}
//               placeholder={t("searchStudentGuardian") || "Search by name, phone or guardian…"}
//               className="w-full rounded-xl border border-line bg-page py-2.5 pl-10 pr-4
//                 text-sm outline-none focus:border-brand-500 focus:bg-surface"
//             />
//           </div>
//         </div>
//       </div>

//       {/* Table */}
//       <div className="overflow-hidden rounded-2xl border border-line bg-surface">
//         <div className="overflow-x-auto">
//           <table className="w-full min-w-[820px] text-left text-sm">
//             <thead>
//               <tr className="border-b border-line bg-page/60 text-[11px] font-semibold
//                 uppercase tracking-wide text-ink-400">
//                 <th className="px-4 py-3">{t("student") || "Student"}</th>
//                 <th className="px-4 py-3">{t("phone") || "Phone"}</th>
//                 <th className="px-4 py-3">{t("guardian") || "Guardian"}</th>
//                 <th className="px-4 py-3">{t("guardianPhone") || "Guardian Phone"}</th>
//                 <th className="px-4 py-3">{t("joined") || "Joined"}</th>
//                 <th className="px-4 py-3">{t("status") || "Status"}</th>
//                 <th className="px-4 py-3 text-right">{t("actions") || "Action"}</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-line">
//               {students === null ? (
//                 <tr><td colSpan={7} className="px-4 py-12 text-center text-ink-400">
//                   {t("loading")}
//                 </td></tr>
//               ) : pageRows.length === 0 ? (
//                 <tr><td colSpan={7} className="px-4 py-16">
//                   <div className="flex flex-col items-center text-center">
//                     <div className="mb-3 grid h-12 w-12 place-items-center rounded-2xl
//                       bg-brand-50 text-brand-600">
//                       <Users className="h-6 w-6" />
//                     </div>
//                     <p className="text-sm font-semibold text-ink-900">
//                       {query || status !== "all"
//                         ? (t("noStudentsMatch") || "No matching students")
//                         : (t("noStudentsYet") || "No students yet — invite to get started")}
//                     </p>
//                     {!query && status === "all" && (
//                       <button onClick={() => setInviteOpen(true)}
//                         className="mt-4 inline-flex items-center gap-2 rounded-xl border
//                           border-brand-200 bg-surface px-4 py-2 text-sm font-semibold
//                           text-brand-600 hover:bg-brand-50 transition-colors">
//                         <UserPlus className="h-4 w-4" />
//                         {t("inviteStudents") || "Invite Students"}
//                       </button>
//                     )}
//                   </div>
//                 </td></tr>
//               ) : (
//                 pageRows.map((s) => (
//                   <tr key={s.id} className="hover:bg-page/70 transition-colors">
//                     <td className="px-4 py-3">
//                       <div className="flex items-center gap-3">
//                         <Avatar name={s.student_name} size="sm" />
//                         <div className="min-w-0">
//                           <p className="truncate font-semibold text-ink-900">{s.student_name}</p>
//                           <p className="truncate text-xs text-ink-400">{s.student_email}</p>
//                         </div>
//                       </div>
//                     </td>
//                     <td className="px-4 py-3 whitespace-nowrap text-ink-600">
//                       {s.student_phone || "—"}
//                     </td>
//                     <td className="px-4 py-3 text-ink-600">{s.guardian_name || "—"}</td>
//                     <td className="px-4 py-3 whitespace-nowrap text-ink-400">
//                       {s.guardian_phone || "—"}
//                     </td>
//                     <td className="px-4 py-3 whitespace-nowrap text-ink-400">
//                       {fmtDate(s.joined_at)}
//                     </td>
//                     <td className="px-4 py-3">
//                       <Badge tone={s.is_active ? "ok" : "slate"}>
//                         {s.is_active ? (t("active") || "Active") : (t("inactive") || "Inactive")}
//                       </Badge>
//                     </td>
//                     <td className="px-4 py-3">
//                       <div className="flex items-center justify-end gap-1.5">
//                         <ActionIcon title={t("message") || "Message"}>
//                           <MessageSquare className="h-4 w-4" />
//                         </ActionIcon>
//                         <ActionIcon title={t("edit") || "Edit"}>
//                           <Pencil className="h-4 w-4" />
//                         </ActionIcon>
//                         <ActionIcon title={t("view") || "View"}>
//                           <Eye className="h-4 w-4" />
//                         </ActionIcon>
//                       </div>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>

//         {/* Pagination footer */}
//         {total > 0 && (
//           <div className="flex flex-wrap items-center justify-between gap-3 border-t
//             border-line px-4 py-3">
//             <p className="text-xs text-ink-400">
//               {(t("showing") || "Showing")} {start + 1}-{Math.min(start + PAGE_SIZE, total)}{" "}
//               {(t("of") || "of")} {total} {t("students")?.toLowerCase() || "students"}
//             </p>
//             <div className="flex items-center gap-1">
//               <button
//                 onClick={() => setPage((p) => Math.max(1, p - 1))}
//                 disabled={current === 1}
//                 className="rounded-lg border border-line px-3 py-1.5 text-sm text-ink-600
//                   disabled:opacity-40 hover:bg-page transition-colors"
//               >
//                 {t("prev") || "Prev"}
//               </button>
//               {Array.from({ length: totalPages }, (_, i) => i + 1)
//                 .filter((p) => Math.abs(p - current) <= 2 || p === 1 || p === totalPages)
//                 .map((p, idx, arr) => (
//                   <span key={p} className="flex items-center">
//                     {idx > 0 && p - arr[idx - 1] > 1 && (
//                       <span className="px-1 text-ink-400">…</span>
//                     )}
//                     <button
//                       onClick={() => setPage(p)}
//                       className={`min-w-[2rem] rounded-lg px-2.5 py-1.5 text-sm font-medium
//                         transition-colors ${
//                           p === current
//                             ? "bg-brand-600 text-white"
//                             : "border border-line text-ink-600 hover:bg-page"
//                         }`}
//                     >
//                       {p}
//                     </button>
//                   </span>
//                 ))}
//               <button
//                 onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
//                 disabled={current === totalPages}
//                 className="rounded-lg border border-line px-3 py-1.5 text-sm text-ink-600
//                   disabled:opacity-40 hover:bg-page transition-colors"
//               >
//                 {t("next") || "Next"}
//               </button>
//             </div>
//           </div>
//         )}
//       </div>

//       <InviteModal
//         open={inviteOpen}
//         onClose={() => { setInviteOpen(false); loadStudents(); }}
//         batchId={id}
//       />

//       {batch && (
//         <BatchModals
//           batch={batch}
//           isTeacher
//           tool={tool}
//           onClose={() => setTool(null)}
//         />
//       )}
//     </AppShell>
//   );
// }
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ChevronLeft, Search, UserPlus, MessageSquare, Trash2, MoreVertical
} from "lucide-react";
import client from "../../api/client";
import AppShell from "../../components/AppShell";
import Avatar from "../../components/ui/Avatar";
import InviteModal from "./InviteModal";
import BatchSidebar from "../room/BatchSidebar";
import BatchSidebarSkeleton from "../room/BatchSidebarSkeleton";
import BatchModals from "../room/BatchModals";

const PAGE_SIZE = 10;

function isThisMonth(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

function fmtDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

export default function StudentListPage() {
  const { id } = useParams();
  const location = useLocation();
  const { t } = useTranslation();

  const [batch, setBatch] = useState(location.state?.batch ?? null);
  const [students, setStudents] = useState(null);
  const [status, setStatus] = useState("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [tool, setTool] = useState(null);

  useEffect(() => {
    client.get(`/api/batches/${id}/`).then((res) => setBatch(res.data)).catch(() => {});
  }, [id]);

  const loadStudents = useCallback(() => {
    client
      .get(`/api/batches/${id}/students/`)
      .then((res) => setStudents(res.data))
      .catch(() => setStudents([]));
  }, [id]);

  useEffect(loadStudents, [loadStudents]);

  const rows = useMemo(() => {
    const list = students || [];
    const q = query.trim().toLowerCase();
    return list.filter((s) => {
      if (status === "active" && !s.is_active) return false;
      if (status === "inactive" && s.is_active) return false;
      if (status === "new" && !isThisMonth(s.joined_at)) return false;
      if (!q) return true;
      return [s.student_name, s.student_email, s.student_phone, s.guardian_name, s.guardian_phone]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [students, status, query]);

  useEffect(() => { setPage(1); }, [status, query]);

  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const start = (current - 1) * PAGE_SIZE;
  const pageRows = rows.slice(start, start + PAGE_SIZE);

  const tabs = [
    { id: "all", label: "All Students", bnLabel: "সব শিক্ষার্থী" },
    { id: "active", label: "Active", bnLabel: "সক্রিয়" },
    { id: "inactive", label: "Inactive", bnLabel: "নিষ্ক্রিয়" },
    { id: "new", label: "New This Month", bnLabel: "চলতি মাসের নতুন" },
  ];

  return (
    <AppShell
      title={t("students") || "Students"}
      sidebar={
        batch ? (
          <BatchSidebar
            batch={batch}
            isTeacher
            upcomingExams={[]}
            onOpen={(key) => (key === "invite" ? setInviteOpen(true) : setTool(key))}
          />
        ) : (
          <BatchSidebarSkeleton />
        )
      }
    >
      <div className="w-full space-y-5 p-4 sm:p-6 bg-slate-50/50 min-h-screen">
        
        {/* Header Banner - Violet/Purple Gradient */}
        <div className="flex flex-col gap-4 bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-600 p-5 text-white shadow-sm sm:flex-row sm:items-center sm:justify-between rounded-none">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to={`/teacher/batches/${id}`}
              state={{ batch }}
              className="flex items-center gap-1 text-xs text-violet-200 hover:text-white transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="font-bold tracking-wider uppercase">AGAMI</span>
              <span className="text-[10px] opacity-80">আগামী</span>
            </Link>
            <span className="text-violet-400">|</span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold">
                  Batch: {batch ? `${batch.name} (${batch.subject || "General"})` : "Loading..."}
                </h1>
                <span className="bg-white/20 px-2.5 py-0.5 text-xs font-medium text-white rounded-none">
                  {students ? students.length : 0} Students Enrolled
                </span>
              </div>
              <p className="mt-0.5 text-xs text-violet-200">
                শ্রেণী কার্যক্রম ও শিক্ষার্থী ট্র্যাকিং পোর্টাল • Coaching Management SaaS
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search student or guardian..."
                className="w-full bg-white/15 py-2 pl-9 pr-4 text-sm text-white placeholder-white/60 outline-none focus:bg-white/25 transition-all rounded-none"
              />
            </div>

            <button
              onClick={() => setInviteOpen(true)}
              className="inline-flex items-center gap-1.5 whitespace-nowrap bg-white px-4 py-2 text-sm font-semibold text-violet-600 shadow-sm hover:bg-violet-50 transition-colors rounded-none"
            >
              <UserPlus className="h-4 w-4" />
              + Invite <span className="text-xs font-normal text-violet-500">আমন্ত্রণ জানান</span>
            </button>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const isActive = status === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setStatus(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-all rounded-none ${
                  isActive
                    ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-xs ${isActive ? "text-violet-200" : "text-slate-400"}`}>
                  {tab.bnLabel}
                </span>
              </button>
            );
          })}
        </div>

        {/* Table Container */}
        <div className="w-full overflow-hidden border border-slate-200 bg-white shadow-sm rounded-none">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-4">AVATAR</th>
                  <th className="px-6 py-4">STUDENT NAME / শিক্ষার্থী</th>
                  <th className="px-6 py-4">PHONE / ফোন</th>
                  <th className="px-6 py-4">GUARDIAN NAME / অভিভাবক</th>
                  <th className="px-6 py-4">GUARDIAN PHONE</th>
                  <th className="px-6 py-4">JOINED DATE</th>
                  <th className="px-6 py-4 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {students === null ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                      {t("loading") || "Loading..."}
                    </td>
                  </tr>
                ) : pageRows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                      No matching students found
                    </td>
                  </tr>
                ) : (
                  pageRows.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <Avatar name={s.student_name} size="md" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{s.student_name}</div>
                        <div className="text-xs text-slate-400">
                          {s.student_name_bn || s.student_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-600">
                        {s.student_phone || "—"}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-800">
                        {s.guardian_name || "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                        {s.guardian_phone || "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                        {fmtDate(s.joined_at)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            title="Message"
                            className="grid h-8 w-8 place-items-center bg-violet-50 text-violet-600 hover:bg-violet-100 transition-colors rounded-none"
                          >
                            <MessageSquare className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            title="Delete"
                            className="grid h-8 w-8 place-items-center bg-red-50 text-red-500 hover:bg-red-100 transition-colors rounded-none"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            title="More options"
                            className="grid h-8 w-8 place-items-center bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors rounded-none"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {total > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-6 py-4">
              <p className="text-xs text-slate-500">
                Showing {start + 1}-{Math.min(start + PAGE_SIZE, total)} of {total} students
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={current === 1}
                  className="border border-slate-200 px-3 py-1.5 text-xs text-slate-600 disabled:opacity-40 hover:bg-slate-50 rounded-none"
                >
                  Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`h-8 w-8 text-xs font-semibold transition-colors rounded-none ${
                      p === current
                        ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white"
                        : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={current === totalPages}
                  className="border border-slate-200 px-3 py-1.5 text-xs text-slate-600 disabled:opacity-40 hover:bg-slate-50 rounded-none"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <InviteModal
        open={inviteOpen}
        onClose={() => { setInviteOpen(false); loadStudents(); }}
        batchId={id}
      />

      {batch && (
        <BatchModals
          batch={batch}
          isTeacher
          tool={tool}
          onClose={() => setTool(null)}
        />
      )}
    </AppShell>
  );
}