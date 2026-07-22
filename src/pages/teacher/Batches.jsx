import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import client from "../../api/client";
import AppShell from "../../components/AppShell";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import CreateBatchModal from "./CreateBatchModal";

export default function Batches() {
  const { t } = useTranslation();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);

  const load = () => {
    setLoading(true);
    client
      .get("/api/batches/")
      .then((res) => setBatches(res.data.results))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  return (
    <AppShell title={t("batches")}>
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-ink-600">
          {loading ? t("loading") : `${batches.length}টি batch`}
        </p>
        <Button className="!w-auto" onClick={() => setCreateOpen(true)}>
          {t("newBatch")}
        </Button>
      </div>

      {!loading && batches.length === 0 && (
        <Card className="text-center py-12">
          <p className="text-sm text-ink-600 mb-1">{t("noBatches")}</p>
        </Card>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {batches.map((b) => (
          <Link key={b.id} to={`/teacher/batches/${b.id}`}>
            <Card className="hover:border-brand-500 transition-colors h-full">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-sm">{b.name}</h3>
                  {b.subject && (
                    <p className="mt-0.5 text-xs text-ink-400">{b.subject}</p>
                  )}
                </div>
                <Badge tone={b.is_active ? "ok" : "neutral"}>
                  {b.is_active ? "চালু" : "বন্ধ"}
                </Badge>
              </div>
              <p className="mt-3 text-xs text-ink-600">
                👥 {b.student_count} {t("students").toLowerCase()}
              </p>
            </Card>
          </Link>
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