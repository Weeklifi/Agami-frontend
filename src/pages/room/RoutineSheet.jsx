import { useEffect, useState } from "react";
import client from "../../api/client";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { useTranslation } from "react-i18next";
import { t } from "i18next";
// প্রদর্শনের ক্রম: বাংলাদেশের সপ্তাহ (শনি → শুক্র)
const WEEKDAYS = [
  [5, t("Saturday")], [6, t("Sunday")], [0, t("Monday")], [1, t("Tuesday")],
  [2, t("Wednesday")], [3, t("Thursday")], [4, t("Friday")],
];

const EMPTY = { weekday: 6, start_time: "", end_time: "", location: "" };

// JS getDay() → Python weekday রূপান্তর (আজকের কলাম highlight-এর জন্য)
const todayPy = (new Date().getDay() + 6) % 7;

const fmt = (t) => t.slice(0, 5); // "18:00:00" → "18:00"

export default function RoutineSheet({ open, onClose, batchId, isTeacher }) {
  const [items, setItems] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [adding, setAdding] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const load = () =>
    client
      .get(`/api/batches/${batchId}/schedules/`)
      .then((res) => setItems(res.data.results));

  useEffect(() => {
    if (open && items === null) load();
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      await client.post(`/api/batches/${batchId}/schedules/`, {
        ...form,
        weekday: Number(form.weekday),
      });
      setForm(EMPTY);
      setAdding(false);
      load();
    } catch (err) {
      setErrors(err.response?.data || {});
    } finally {
      setLoading(false);
    }
  };

  const remove = async (scheduleId) => {
    if (!confirm(t("delete Confirm?"))) return;
    await client.delete(`/api/batches/${batchId}/schedules/${scheduleId}/`);
    load();
  };

  // সময়-slot গুলো: distinct (start,end) জোড়া, সময় অনুযায়ী sorted
  const slots = items
    ? [...new Set(items.map((s) => `${s.start_time}|${s.end_time}`))]
        .sort()
        .map((key) => {
          const [start, end] = key.split("|");
          return { key, start, end };
        })
    : [];

  const cellItems = (slot, weekday) =>
    items.filter(
      (s) =>
        s.weekday === weekday &&
        s.start_time === slot.start &&
        s.end_time === slot.end
    );

  return (
    <Modal open={open} onClose={onClose} title={t("Class Routine")} wide>
      {items === null ? (
        <p className="text-sm text-ink-400">{t("loading")}</p>
      ) : (
        <div className="space-y-4">
          {items.length === 0 && !adding && (
            <p className="text-sm text-ink-400 text-center py-4">
              {t("No Class Scheduled yet.")}
            </p>
          )}

          {/* ===== Desktop: Timetable Grid ===== */}
          {items.length > 0 && (
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr>
                    <th className="border-b border-line px-3 py-2 text-left
                      text-xs font-semibold text-ink-400 uppercase w-36">
                      {t("Time/Days")}
                    </th>
                    {WEEKDAYS.map(([v, label]) => (
                      <th
                        key={v}
                        className={`border-b border-line px-3 py-2 text-center
                          text-xs font-semibold uppercase
                          ${v === todayPy ? "text-brand-600" : "text-ink-400"}`}
                      >
                        {label}
                        {v === todayPy && (
                          <span className="block text-[10px] font-normal">{t("Today")}</span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {slots.map((slot) => (
                    <tr key={slot.key} className="border-b border-line/60">
                      <td className="px-3 py-3 text-xs font-semibold whitespace-nowrap">
                        {fmt(slot.start)} – {fmt(slot.end)}
                      </td>
                      {WEEKDAYS.map(([v]) => (
                        <td
                          key={v}
                          className={`px-2 py-3 text-center align-top
                            ${v === todayPy ? "bg-brand-50/50" : ""}`}
                        >
                          {cellItems(slot, v).map((s) => (
                            <div
                              key={s.id}
                              className="group inline-flex items-center gap-1.5
                                rounded-lg bg-brand-50 px-2.5 py-1.5 text-xs
                                font-medium text-brand-700"
                            >
                              <span>{s.location || "ক্লাস"}</span>
                              {isTeacher && (
                                <button
                                  onClick={() => remove(s.id)}
                                  className="hidden group-hover:inline text-ink-400
                                    hover:text-err"
                                  title="মুছুন"
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                          ))}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ===== Mobile: দিন-ভিত্তিক list ===== */}
          {items.length > 0 && (
            <div className="md:hidden space-y-3">
              {WEEKDAYS.map(([v, label]) => {
                const dayItems = items
                  .filter((s) => s.weekday === v)
                  .sort((a, b) => a.start_time.localeCompare(b.start_time));
                if (dayItems.length === 0) return null;
                return (
                  <div
                    key={v}
                    className={`rounded-lg border p-3
                      ${v === todayPy ? "border-brand-500 bg-brand-50/40" : "border-line"}`}
                  >
                    <p className={`text-xs font-semibold mb-2
                      ${v === todayPy ? "text-brand-600" : "text-ink-600"}`}>
                      {label} {v === todayPy && "· আজ"}
                    </p>
                    <ul className="space-y-1.5">
                      {dayItems.map((s) => (
                        <li key={s.id} className="flex items-center justify-between">
                          <span className="text-sm">
                            {fmt(s.start_time)} – {fmt(s.end_time)}
                            {s.location && (
                              <span className="text-ink-400"> · {s.location}</span>
                            )}
                          </span>
                          {isTeacher && (
                            <button
                              onClick={() => remove(s.id)}
                              className="text-xs text-ink-400 hover:text-err"
                            >
                              মুছুন
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}

          {/* ===== Add form (আগের মতোই) ===== */}
          {isTeacher &&
            (adding ? (
              <form onSubmit={submit} className="space-y-3 rounded-lg bg-page p-3 max-w-md">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium">বার</label>
                  <select
                    value={form.weekday}
                    onChange={set("weekday")}
                    className="w-full rounded-lg border border-line bg-surface
                      px-3.5 py-2.5 text-sm outline-none focus:border-brand-500"
                  >
                    {WEEKDAYS.map(([v, label]) => (
                      <option key={v} value={v}>{label}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input label="শুরু" type="time" value={form.start_time}
                    onChange={set("start_time")} error={errors.start_time?.[0]} />
                  <Input label="শেষ" type="time" value={form.end_time}
                    onChange={set("end_time")} error={errors.end_time?.[0]} />
                </div>
                <Input label="স্থান (ঐচ্ছিক)" placeholder="Room 2 / Google Meet"
                  value={form.location} onChange={set("location")} />
                {errors.non_field_errors && (
                  <p className="text-sm text-err">{errors.non_field_errors[0]}</p>
                )}
                <div className="flex gap-2">
                  <Button type="submit" loading={loading}>যোগ করুন</Button>
                  <Button type="button" variant="secondary"
                    onClick={() => setAdding(false)}>বাতিল</Button>
                </div>
              </form>
            ) : (
              <Button variant="secondary" className="!w-auto"
                onClick={() => setAdding(true)}>
                {t("Add Class")}
              </Button>
            ))}
        </div>
      )}
    </Modal>
  );
}