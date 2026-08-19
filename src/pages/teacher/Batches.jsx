import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BookOpen, Users, Plus, Search } from "lucide-react";
import client from "../../api/client";
import AppShell from "../../components/AppShell";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import BatchCard from "../../components/BatchCard";
import CreateBatchModal from "./CreateBatchModal";

export default function Batches() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [q, setQ] = useState("");

  const load = () => {
    setLoading(true);
    client
      .get("/api/batches/")
      .then((res) => setBatches(res.data.results))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const shown = batches.filter(
    (b) =>
      b.name?.toLowerCase().includes(q.toLowerCase()) ||
      b.subject?.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <AppShell title={t("batches")}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-ink-600">
          {loading ? t("loading") : `${batches.length}টি batch`}
        </p>
        <Button className="!w-auto px-4 py-2.5" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" /> নতুন
        </Button>
      </div>

      {batches.length > 4 && (
        <div className="relative mb-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2
            h-4 w-4 text-ink-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ব্যাচ খুঁজুন…"
            className="w-full rounded-xl border border-line bg-surface py-3 pl-9 pr-3.5
              text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </div>
      )}

      {!loading && batches.length === 0 && (
        <EmptyState
          icon={BookOpen}
          title={t("noBatches")}
          subtitle="প্রথম batch তৈরি করে ছাত্রছাত্রীদের যুক্ত করুন"
          actionLabel={
            <>
              <Plus className="h-4 w-4" /> batch তৈরি করুন
            </>
          }
          onAction={() => setCreateOpen(true)}
        />
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((b) => (
          <BatchCard
            key={b.id}
            batch={b}
            onClick={() => navigate(`/teacher/batches/${b.id}`)}
            meta={
              <p className="truncate text-xs text-ink-500">
                {b.subject || "Room খুলতে tap করুন"}
              </p>
            }
            footer={
              <div className="flex w-full items-center justify-between px-2 py-1">
                <Badge tone="indigo">
                  <Users className="h-3.5 w-3.5" /> {b.student_count}
                </Badge>
                <Badge tone={b.is_active ? "emerald" : "slate"}>
                  {b.is_active ? "চালু" : "বন্ধ"}
                </Badge>
              </div>
            }
          />
        ))}
      </div>

      <CreateBatchModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={load}
      />
    </AppShell>
  );
}
