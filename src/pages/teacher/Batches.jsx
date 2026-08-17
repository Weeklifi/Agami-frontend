import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BookOpen, Users, Plus, Search, ChevronRight } from "lucide-react";
import client from "../../api/client";
import AppShell from "../../components/AppShell";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import IconTile from "../../components/ui/IconTile";
import CreateBatchModal from "./CreateBatchModal";

const tileTones = ["indigo", "violet", "emerald", "sky", "amber", "rose"];

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
        <Card className="text-center py-12">
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl
            bg-brand-50 text-brand-600">
            <BookOpen className="h-6 w-6" />
          </div>
          <p className="text-sm text-ink-600 mb-1">{t("noBatches")}</p>
          <button
            onClick={() => setCreateOpen(true)}
            className="text-xs font-medium text-brand-600 hover:underline"
          >
            প্রথম batch তৈরি করুন →
          </button>
        </Card>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {shown.map((b, i) => (
          <Card
            key={b.id}
            as="button"
            onClick={() => navigate(`/teacher/batches/${b.id}`)}
            className="text-left hover:border-brand-300 transition-colors"
          >
            <div className="flex items-center gap-3">
              <IconTile icon={BookOpen} tone={tileTones[i % tileTones.length]} size="lg" />
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-bold">{b.name}</h3>
                <p className="mt-0.5 truncate text-xs text-ink-400">
                  {b.subject || "Room খুলতে tap করুন"}
                </p>
              </div>
              <ChevronRight className="h-5 w-5 shrink-0 text-ink-400" />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge tone="indigo">
                <Users className="h-3.5 w-3.5" /> {b.student_count}
              </Badge>
              <Badge tone={b.is_active ? "emerald" : "slate"}>
                {b.is_active ? "চালু" : "বন্ধ"}
              </Badge>
            </div>
          </Card>
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
