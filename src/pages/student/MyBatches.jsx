import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import client from "../../api/client";
import AppShell from "../../components/AppShell";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import JoinByCodeModal from "./JoinByCodeModal";
import { useTranslation } from "react-i18next";
export default function MyBatches() {
  const { t } = useTranslation();
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
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-ink-600">
          {loading ? t("loading") : `${batches.length}টি batch`}
        </p>
        <Button className="!w-auto" onClick={() => setJoinOpen(true)}>
          + Join Room
        </Button>
      </div>

      {!loading && batches.length === 0 && (
        <Card className="text-center py-12">
          <p className="text-sm text-ink-600 mb-1">
            {t("noBatches")}
          </p>
          <p className="text-xs text-ink-400">
            {t("joinBatchInstructions")}
          </p>
        </Card>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {batches.map((b) => (
          <Link key={b.id} to={`/student/batches/${b.id}`}>
            <Card className="hover:border-brand-500 transition-colors h-full">
              <h3 className="font-semibold text-sm">{b.name}</h3>
              {b.subject && (
                <p className="mt-0.5 text-xs text-ink-400">{b.subject}</p>
              )}
              <p className="mt-3 text-xs text-ink-600">
                🎓 {b.teacher_name}
              </p>
            </Card>
          </Link>
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