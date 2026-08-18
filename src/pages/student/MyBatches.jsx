import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BookOpen, GraduationCap, Plus } from "lucide-react";
import client from "../../api/client";
import AppShell from "../../components/AppShell";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import BatchCard from "../../components/BatchCard";
import JoinByCodeModal from "./JoinByCodeModal";

export default function MyBatches() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joinOpen, setJoinOpen] = useState(false);

  const load = () => {
    setLoading(true);
    client
      .get("/api/batches/my/")
      .then((res) => setBatches(res.data.results))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  return (
    <AppShell title="আমার Batch">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-ink-600">
          {loading ? t("loading") : `${batches.length}টি batch`}
        </p>
        <Button className="!w-auto px-4 py-2.5" onClick={() => setJoinOpen(true)}>
          <Plus className="h-4 w-4" /> Join
        </Button>
      </div>

      {!loading && batches.length === 0 && (
        <EmptyState
          icon={BookOpen}
          title={t("noBatches")}
          subtitle="Invite Code দিয়ে নতুন ব্যাচে যোগ দিয়ে ক্লাস শুরু করুন"
          actionLabel={
            <>
              <Plus className="h-4 w-4" /> Join করুন
            </>
          }
          onAction={() => setJoinOpen(true)}
        />
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {batches.map((b) => (
          <BatchCard
            key={b.id}
            batch={b}
            onClick={() => navigate(`/student/batches/${b.id}`)}
            meta={
              <p className="flex items-center gap-1.5 truncate text-xs text-ink-500">
                <GraduationCap className="h-3.5 w-3.5 shrink-0" /> {b.teacher_name}
              </p>
            }
          />
        ))}
      </div>

      <JoinByCodeModal
        open={joinOpen}
        onClose={() => setJoinOpen(false)}
        onJoined={load}
      />
    </AppShell>
  );
}
