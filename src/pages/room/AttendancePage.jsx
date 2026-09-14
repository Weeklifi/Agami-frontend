// import { useEffect, useState } from "react";
// import { Link, useLocation, useParams } from "react-router-dom";
// import { useTranslation } from "react-i18next";
// import { ChevronLeft, ClipboardCheck, BarChart3 } from "lucide-react";
// import client from "../../api/client";
// import { useAuth } from "../../context/AuthContext";
// import AppShell from "../../components/AppShell";
// import AttendanceSheet from "./AttendanceSheet";
// import AttendanceReport from "./AttendanceReport";
// import AttendanceStudent from "./AttendanceStudent";
// import BatchSidebar from "./BatchSidebar";
// import BatchSidebarSkeleton from "./BatchSidebarSkeleton";
// import BatchModals from "./BatchModals";

// export default function AttendancePage() {
//   const { id } = useParams();
//   const location = useLocation();
//   const { t } = useTranslation();
//   const { user } = useAuth();
//   const isTeacher = user?.role === "TEACHER";

//   const [batch, setBatch] = useState(location.state?.batch ?? null);
//   const [tab, setTab] = useState("sheet"); // sheet | report
//   const [tool, setTool] = useState(null);

//   useEffect(() => {
//     if (isTeacher) {
//       client.get(`/api/batches/${id}/`).then((res) => setBatch(res.data)).catch(() => {});
//     } else {
//       client
//         .get(`/api/batches/my/`)
//         .then((res) => setBatch(res.data.results.find((b) => b.id === id) || null))
//         .catch(() => {});
//     }
//   }, [id, isTeacher]);

//   const roomPath = isTeacher ? `/teacher/batches/${id}` : `/student/batches/${id}`;

//   const TABS = [
//     ["sheet", t("takeAttendance") || "Take Attendance", ClipboardCheck],
//     ["report", t("monthlyReport") || "Monthly Report", BarChart3],
//   ];

//   return (
//     <AppShell
//       title={isTeacher ? t("attendance") : t("myAttendance")}
//       sidebar={
//         batch ? (
//           <BatchSidebar
//             batch={batch}
//             isTeacher={isTeacher}
//             upcomingExams={[]}
//             onOpen={setTool}
//           />
//         ) : (
//           <BatchSidebarSkeleton />
//         )
//       }
//     >
//       {/* Breadcrumb */}
//       <div className="mb-4 flex items-center gap-2 text-sm text-ink-400">
//         <Link to={roomPath} state={{ batch }}
//           className="flex items-center gap-1 hover:text-brand-600 transition-colors">
//           <ChevronLeft className="h-4 w-4" />
//           {batch ? batch.name : t("batches")}
//         </Link>
//         <span>/</span>
//         <span className="font-medium text-ink-600">
//           {isTeacher ? t("attendance") : t("myAttendance")}
//         </span>
//       </div>

//       {/* Title */}
//       <div className="mb-5">
//         <h2 className="text-2xl font-bold text-ink-900">
//           {isTeacher ? t("attendance") : t("myAttendance")}
//         </h2>
//         {batch && (
//           <p className="mt-0.5 text-sm text-ink-400">
//             {batch.name}{batch.subject ? ` · ${batch.subject}` : ""}
//           </p>
//         )}
//       </div>

//       {/* Teacher: tabs + content | Student: own report */}
//       {isTeacher ? (
//         <div className="rounded-2xl border border-line bg-surface p-4 sm:p-5">
//           <div className="mb-4 flex gap-1 border-b border-line">
//             {TABS.map(([key, label, Icon]) => (
//               <button
//                 key={key}
//                 onClick={() => setTab(key)}
//                 className={`flex items-center gap-2 px-4 py-2.5 text-sm transition-colors
//                   ${tab === key
//                     ? "border-b-2 border-brand-600 font-semibold text-brand-600"
//                     : "text-ink-600 hover:text-ink-900"
//                   }`}
//               >
//                 <Icon className="h-4 w-4" />
//                 {label}
//               </button>
//             ))}
//           </div>

//           {tab === "sheet" ? (
//             <AttendanceSheet batchId={id} />
//           ) : (
//             <AttendanceReport batchId={id} />
//           )}
//         </div>
//       ) : (
//         <div className="mx-auto max-w-xl">
//           <AttendanceStudent batchId={id} />
//         </div>
//       )}

//       {batch && (
//         <BatchModals
//           batch={batch}
//           isTeacher={isTeacher}
//           tool={tool}
//           onClose={() => setTool(null)}
//         />
//       )}
//     </AppShell>
//   );
// }
import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ClipboardCheck, BarChart3 } from "lucide-react";
import client from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import AppShell from "../../components/AppShell";
import AttendanceSheet from "./AttendanceSheet";
import AttendanceReport from "./AttendanceReport";
import AttendanceStudent from "./AttendanceStudent";
import BatchSidebar from "./BatchSidebar";
import BatchSidebarSkeleton from "./BatchSidebarSkeleton";
import BatchModals from "./BatchModals";

export default function AttendancePage() {
  const { id } = useParams();
  const location = useLocation();
  const { t } = useTranslation();
  const { user } = useAuth();
  const isTeacher = user?.role === "TEACHER";

  const [batch, setBatch] = useState(location.state?.batch ?? null);
  const [tab, setTab] = useState("sheet");
  const [tool, setTool] = useState(null);

  useEffect(() => {
    if (isTeacher) {
      client.get(`/api/batches/${id}/`).then((res) => setBatch(res.data)).catch(() => {});
    } else {
      client
        .get(`/api/batches/my/`)
        .then((res) => setBatch(res.data.results.find((b) => b.id === id) || null))
        .catch(() => {});
    }
  }, [id, isTeacher]);

  const roomPath = isTeacher ? `/teacher/batches/${id}` : `/student/batches/${id}`;

  const TABS = [
    { id: "sheet", label: t("takeAttendance") || "Take Attendance", icon: ClipboardCheck },
    { id: "report", label: t("monthlyReport") || "Monthly Report", icon: BarChart3 },
  ];

  return (
    <AppShell
      title={isTeacher ? t("attendance") : t("myAttendance")}
      sidebar={
        batch ? (
          <BatchSidebar
            batch={batch}
            isTeacher={isTeacher}
            upcomingExams={[]}
            onOpen={setTool}
          />
        ) : (
          <BatchSidebarSkeleton />
        )
      }
    >
      <div className="w-full space-y-5 p-4 sm:p-6 bg-slate-50/50 min-h-screen">
        
        {/* Top Header Banner - Violet/Purple Gradient */}
        <div className="flex flex-col gap-4 bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-600 p-5 text-white shadow-sm sm:flex-row sm:items-center sm:justify-between rounded-none">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to={roomPath}
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
                {batch?.students_count !== undefined && (
                  <span className="bg-white/20 px-2.5 py-0.5 text-xs font-medium text-white rounded-none">
                    {batch.students_count} Students Enrolled
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-violet-200">
                {isTeacher
                  ? "উপস্থিতি ব্যবস্থাপনা ও উপস্থিতি রিপোর্ট পোর্টাল • Coaching Management SaaS"
                  : "আপনার উপস্থিতির সার্বিক রেকর্ড ও পরিসংখ্যান"}
              </p>
            </div>
          </div>
        </div>

        {/* Teacher View */}
        {isTeacher ? (
          <div className="w-full space-y-4">
            {/* Tab Buttons */}
            <div className="flex flex-wrap gap-2">
              {TABS.map((item) => {
                const Icon = item.icon;
                const isActive = tab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setTab(item.id)}
                    className={`flex items-center gap-2 px-5 py-2 text-sm font-semibold transition-all rounded-none ${
                      isActive
                        ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm"
                        : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Main Content Container */}
            <div className="w-full border border-slate-200 bg-white p-5 shadow-sm rounded-none">
              {tab === "sheet" ? (
                <AttendanceSheet batchId={id} />
              ) : (
                <AttendanceReport batchId={id} />
              )}
            </div>
          </div>
        ) : (
          /* Student View */
          <div className="w-full border border-slate-200 bg-white p-6 shadow-sm rounded-none">
            <AttendanceStudent batchId={id} />
          </div>
        )}
      </div>

      {batch && (
        <BatchModals
          batch={batch}
          isTeacher={isTeacher}
          tool={tool}
          onClose={() => setTool(null)}
        />
      )}
    </AppShell>
  );
}