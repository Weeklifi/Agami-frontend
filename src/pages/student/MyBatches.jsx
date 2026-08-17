import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BookOpen, GraduationCap, Plus, ChevronRight } from "lucide-react";
import client from "../../api/client";
import AppShell from "../../components/AppShell";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import IconTile from "../../components/ui/IconTile";
import JoinByCodeModal from "./JoinByCodeModal";

const tileTones = ["indigo", "violet", "emerald", "sky", "amber", "rose"];

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
        <Card className="text-center py-12">
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl
            bg-brand-50 text-brand-600">
            <Plus className="h-6 w-6" />
          </div>
          <p className="text-sm text-ink-600 mb-1">{t("noBatches")}</p>
          <p className="text-xs text-ink-400">
            Invite Code দিয়ে নতুন ব্যাচে যোগ দিন
          </p>
        </Card>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {batches.map((b, i) => (
          <Card
            key={b.id}
            as="button"
            onClick={() => navigate(`/student/batches/${b.id}`)}
            className="text-left hover:border-brand-300 transition-colors"
          >
            <div className="flex items-center gap-3">
              <IconTile icon={BookOpen} tone={tileTones[i % tileTones.length]} size="lg" />
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-bold">{b.name}</h3>
                <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-ink-400">
                  <GraduationCap className="h-3.5 w-3.5 shrink-0" /> {b.teacher_name}
                </p>
              </div>
              <ChevronRight className="h-5 w-5 shrink-0 text-ink-400" />
            </div>
            {b.subject && (
              <p className="mt-3 text-xs text-ink-600">{b.subject}</p>
            )}
          </Card>
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
