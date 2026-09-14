import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronLeft } from "lucide-react";
import client from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import AppShell from "../../components/AppShell";
import { RoutineContent } from "./RoutineSheet";
import BatchSidebar from "./BatchSidebar";
import BatchSidebarSkeleton from "./BatchSidebarSkeleton";
import BatchModals from "./BatchModals";

export default function RoutinePage() {
  const { id } = useParams();
  const location = useLocation();
  const { t } = useTranslation();
  const { user } = useAuth();
  const isTeacher = user?.role === "TEACHER";

  const [batch, setBatch] = useState(location.state?.batch ?? null);
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

  return (
    <AppShell
      title={t("routine") || "Routine"}
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
      {/* Breadcrumb */}
      <div className="mb-4 flex items-center gap-2 text-sm text-ink-400">
        <Link to={roomPath} state={{ batch }}
          className="flex items-center gap-1 hover:text-brand-600 transition-colors">
          <ChevronLeft className="h-4 w-4" />
          {batch ? batch.name : t("batches")}
        </Link>
        <span>/</span>
        <span className="font-medium text-ink-600">{t("routine") || "Routine"}</span>
      </div>

      {/* Title */}
      <div className="mb-5">
        <h2 className="text-2xl font-bold text-ink-900">{t("routine") || "Class Routine"}</h2>
        {batch && (
          <p className="mt-0.5 text-sm text-ink-400">
            {batch.name}{batch.subject ? ` · ${batch.subject}` : ""}
          </p>
        )}
      </div>

      {/* Content */}
      <div className="rounded-2xl border border-line bg-surface p-4 sm:p-5">
        <RoutineContent batchId={id} isTeacher={isTeacher} />
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
