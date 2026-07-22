import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import client from "../../api/client";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

export default function CreateBatchModal({ open, onClose, onCreated }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", subject: "", description: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [needsSub, setNeedsSub] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      await client.post("/api/batches/", form);
      onCreated();
      onClose();
      setForm({ name: "", subject: "", description: "" });
    } catch (err) {
      if (err.response?.status === 403) setNeedsSub(true);
      else setErrors(err.response?.data || { detail: t("error") });
    } finally {
      setLoading(false);
    }
  };

  const startTrial = async () => {
    setLoading(true);
    try {
      await client.post("/api/subscriptions/trial/");
      setNeedsSub(false);
    } catch {
      navigate("/teacher/subscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={t("newBatch")}>
      {needsSub ? (
        <div className="space-y-4 text-center py-2">
          <div className="text-3xl">🔒</div>
          <p className="text-sm text-ink-600 leading-relaxed">
            {t("needSubscription")}
          </p>
          <Button onClick={startTrial} loading={loading}>
            {t("freeTrial")}
          </Button>
          <button
            onClick={() => navigate("/teacher/subscription")}
            className="text-sm text-brand-600 hover:underline block w-full"
          >
            {t("seePlans")}
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <Input label={t("batchName")} placeholder="HSC 2027 Physics"
            value={form.name} onChange={set("name")} error={errors.name?.[0]} />
          <Input label={`${t("subject")} (${t("optional")})`}
            value={form.subject} onChange={set("subject")} />
          <Input label={`${t("description")} (${t("optional")})`}
            value={form.description} onChange={set("description")} />
          {errors.detail && <p className="text-sm text-err">{errors.detail}</p>}
          <Button type="submit" loading={loading}>{t("create")}</Button>
        </form>
      )}
    </Modal>
  );
}