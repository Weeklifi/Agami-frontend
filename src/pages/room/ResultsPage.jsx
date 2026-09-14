// import { useEffect, useState } from "react";
// import { Link, useLocation, useParams } from "react-router-dom";
// import { useTranslation } from "react-i18next";
// import { ChevronLeft } from "lucide-react";
// import client from "../../api/client";
// import { useAuth } from "../../context/AuthContext";
// import AppShell from "../../components/AppShell";
// import ExamList from "./ExamList";
// import ExamSheet from "./ExamSheet";
// import Leaderboard from "./Leaderboard";
// import BatchSidebar from "./BatchSidebar";
// import BatchSidebarSkeleton from "./BatchSidebarSkeleton";
// import BatchModals from "./BatchModals";

// export default function ResultsPage() {
//   const { id } = useParams();
//   const location = useLocation();
//   const { t } = useTranslation();
//   const { user } = useAuth();
//   const isTeacher = user?.role === "TEACHER";

//   const [batch, setBatch] = useState(location.state?.batch ?? null);
//   const [view, setView] = useState({ mode: "list", exam: null }); // list | sheet | board
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
//   const backToList = () => setView({ mode: "list", exam: null });

//   return (
//     <AppShell
//       title={t("results") || "Results"}
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
//         <span className="font-medium text-ink-600">{t("results") || "Results"}</span>
//       </div>

//       {/* Title */}
//       <div className="mb-5">
//         <h2 className="text-2xl font-bold text-ink-900">{t("results") || "Results"}</h2>
//         {batch && (
//           <p className="mt-0.5 text-sm text-ink-400">
//             {batch.name}{batch.subject ? ` · ${batch.subject}` : ""}
//           </p>
//         )}
//       </div>

//       {/* Content */}
//       <div className="rounded-2xl border border-line bg-surface p-4 sm:p-5">
//         {view.mode === "list" && (
//           <ExamList
//             batchId={id}
//             isTeacher={isTeacher}
//             onOpenSheet={(ex) => setView({ mode: "sheet", exam: ex })}
//             onOpenBoard={(ex) => setView({ mode: "board", exam: ex })}
//           />
//         )}
//         {view.mode === "sheet" && (
//           <ExamSheet exam={view.exam} onBack={backToList} />
//         )}
//         {view.mode === "board" && (
//           <Leaderboard exam={view.exam} isTeacher={isTeacher} onBack={backToList} />
//         )}
//       </div>

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
import { ChevronLeft } from "lucide-react";
import client from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import AppShell from "../../components/AppShell";
import ExamList from "./ExamList";
import ExamSheet from "./ExamSheet";
import Leaderboard from "./Leaderboard";
import BatchSidebar from "./BatchSidebar";
import BatchSidebarSkeleton from "./BatchSidebarSkeleton";
import BatchModals from "./BatchModals";

export default function ResultsPage() {
  const { id } = useParams();
  const location = useLocation();
  const { t } = useTranslation();
  const { user } = useAuth();
  const isTeacher = user?.role === "TEACHER";

  const [batch, setBatch] = useState(location.state?.batch ?? null);
  const [view, setView] = useState({ mode: "list", exam: null }); // list | sheet | board
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
  const backToList = () => setView({ mode: "list", exam: null });

  return (
    <AppShell
      title={t("results") || "Results"}
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
      {/* Container - Solid Full Width */}
      <div className="w-full space-y-5 p-4 sm:p-6 bg-slate-50/50 min-h-screen">
        
        {/* Top Header Banner - Custom Image Color (#6338f6) + Solid Rectangle (rounded-none) */}
        <div className="flex flex-col gap-4 bg-[#6338f6] p-5 text-white shadow-sm sm:flex-row sm:items-center sm:justify-between rounded-none">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to={roomPath}
              state={{ batch }}
              className="flex items-center gap-1 text-xs text-purple-200 hover:text-white transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="font-bold tracking-wider uppercase">AGAMI</span>
              <span className="text-[10px] opacity-80">আগামী</span>
            </Link>
            <span className="text-purple-300/40">|</span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold">
                  Batch: {batch ? `${batch.name} (${batch.subject || "General"})` : "Loading..."}
                </h1>
                {batch?.students_count !== undefined && (
                  <span className="bg-white/20 px-2 py-0.5 text-xs font-medium text-white rounded-none">
                    {batch.students_count} Students Enrolled
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-purple-100/80">
                পরীক্ষার ফলাফল, নম্বরপত্র ও মেধা তালিকা পোর্টাল • Coaching Management SaaS
              </p>
            </div>
          </div>
        </div>

        {/* Content Box - Solid Rectangle (rounded-none) */}
        <div className="w-full border border-slate-200 bg-white p-5 shadow-sm rounded-none">
          {view.mode === "list" && (
            <ExamList
              batchId={id}
              isTeacher={isTeacher}
              onOpenSheet={(ex) => setView({ mode: "sheet", exam: ex })}
              onOpenBoard={(ex) => setView({ mode: "board", exam: ex })}
            />
          )}
          {view.mode === "sheet" && (
            <ExamSheet exam={view.exam} onBack={backToList} />
          )}
          {view.mode === "board" && (
            <Leaderboard exam={view.exam} isTeacher={isTeacher} onBack={backToList} />
          )}
        </div>
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