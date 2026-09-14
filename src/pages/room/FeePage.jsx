import { Fragment, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ChevronLeft, RefreshCw, Pencil, ChevronsLeft, ChevronRight, ChevronsRight,
} from "lucide-react";
import client from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import AppShell from "../../components/AppShell";
import Avatar from "../../components/ui/Avatar";
import BatchSidebar from "./BatchSidebar";
import BatchSidebarSkeleton from "./BatchSidebarSkeleton";
import BatchModals from "./BatchModals";

const ACCENT = "#6338f6";
const PAGE_SIZE = 15;

const monthStr = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

const fmtAmount = (n) => `${Number(n || 0).toLocaleString("en-US")} BDT`;

const fmtDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
};

const fmtMonth = (monthDateStr) => {
  if (!monthDateStr) return "—";
  return new Date(monthDateStr).toLocaleDateString("en-GB", {
    month: "long", year: "numeric",
  });
};

// month-এর ১ তারিখ + grace day → due date
const dueDate = (monthDateStr, graceDay) => {
  if (!monthDateStr || !graceDay) return "—";
  const d = new Date(monthDateStr);
  d.setDate(graceDay);
  return fmtDate(d.toISOString());
};

const STATUS_STYLE = {
  PAID: { label: "Paid", cls: "text-emerald-600" },
  DUE: { label: "Due", cls: "text-rose-600" },
  PENDING_VERIFICATION: { label: "Pending Verification", cls: "text-amber-600" },
  WAIVED: { label: "Waived", cls: "text-slate-500" },
};

const METHODS = [
  ["BKASH", "bKash"], ["NAGAD", "Nagad"], ["BANK", "Bank"], ["OTHER", "Other"],
];

/** Table shell — দুই role-এই একই কাঠামো ব্যবহার করে। */
function FeeTable({ columns, rows, page, setPage, onRefresh, refreshing, emptyText, children }) {
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const start = (current - 1) * PAGE_SIZE;
  const pageRows = rows.slice(start, start + PAGE_SIZE);

  return (
    <div className="w-full border border-slate-300 bg-white shadow-sm rounded-none">
      <div className="flex items-center justify-end gap-1 border-b border-slate-200 px-2 py-1.5">
        <button
          type="button"
          title="Refresh"
          onClick={onRefresh}
          className="rounded p-1.5 text-slate-500 hover:bg-slate-100"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-slate-300 bg-slate-50 font-bold text-slate-600">
              {columns.map((c) => (
                <th key={c} className="border-r border-slate-200 px-4 py-3 uppercase
                  last:border-r-0">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-slate-700">
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-slate-400">
                  {emptyText}
                </td>
              </tr>
            ) : (
              pageRows.map((row) => row)
            )}
          </tbody>
        </table>
      </div>

      {children}

      {rows.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t
          border-slate-300 bg-slate-50 px-4 py-2.5 text-xs text-slate-600">
          <span>
            {start + 1}–{Math.min(start + PAGE_SIZE, rows.length)} of {rows.length}
          </span>
          <div className="flex items-center gap-1 text-slate-500">
            <button onClick={() => setPage(1)} disabled={current === 1}
              className="p-1 hover:text-slate-800 disabled:opacity-30">
              <ChevronsLeft className="h-4 w-4" />
            </button>
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={current === 1}
              className="p-1 hover:text-slate-800 disabled:opacity-30">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-1 font-medium text-slate-800">
              Page {current} of {totalPages}
            </span>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={current === totalPages}
              className="p-1 hover:text-slate-800 disabled:opacity-30">
              <ChevronRight className="h-4 w-4" />
            </button>
            <button onClick={() => setPage(totalPages)} disabled={current === totalPages}
              className="p-1 hover:text-slate-800 disabled:opacity-30">
              <ChevronsRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================== TEACHER ============================== */

function TeacherFeeView({ batch }) {
  const [fee, setFee] = useState(undefined); // undefined=loading, null=unset
  const [feeInput, setFeeInput] = useState("");
  const [editingFee, setEditingFee] = useState(false);
  const [savingFee, setSavingFee] = useState(false);
  const [month, setMonth] = useState(new Date());
  const [records, setRecords] = useState(null);
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    client.get(`/api/batches/${batch.id}/fee/`).then((res) => {
      setFee(res.data.monthly_fee);
      if (res.data.monthly_fee) setFeeInput(res.data.monthly_fee);
    });
  }, [batch.id]);

  const loadRecords = () => {
    setRefreshing(true);
    client
      .get(`/api/batches/${batch.id}/fee-records/?month=${monthStr(month)}`)
      .then((res) => setRecords(res.data.records))
      .finally(() => setRefreshing(false));
  };

  useEffect(() => {
    if (fee) loadRecords();
  }, [fee, month]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => setPage(1), [month]);

  const saveFee = async () => {
    setSavingFee(true);
    await client.put(`/api/batches/${batch.id}/fee/`, { monthly_fee: feeInput });
    setFee(feeInput);
    setEditingFee(false);
    setSavingFee(false);
  };

  const toggle = async (record) => {
    const next = record.status === "PAID" ? "DUE" : "PAID";
    await client.post(`/api/payments/records/${record.id}/mark/`, {
      status: next,
      method: next === "PAID" ? "CASH" : "",
    });
    loadRecords();
  };

  const confirm = async (recordId) => {
    await client.post(`/api/payments/records/${recordId}/confirm/`);
    loadRecords();
  };

  const shiftMonth = (delta) => {
    const d = new Date(month);
    d.setMonth(d.getMonth() + delta);
    setMonth(d);
  };

  if (fee === undefined) {
    return <p className="text-sm text-slate-400">লোড হচ্ছে…</p>;
  }

  if (fee === null) {
    return (
      <div className="max-w-md border border-slate-300 bg-white p-5 text-center shadow-sm">
        <p className="text-sm text-slate-600">
          আগে এই batch-এর মাসিক বেতন ঠিক করুন — তারপর প্রতি মাসের আদায়ের
          হিসাব এখানে দেখা যাবে।
        </p>
        <div className="mt-3 flex gap-2">
          <input
            type="number"
            placeholder="500"
            value={feeInput}
            onChange={(e) => setFeeInput(e.target.value)}
            className="flex-1 rounded-none border border-slate-300 px-3 py-2 text-sm
              outline-none focus:border-[#6338f6]"
          />
          <button
            type="button"
            onClick={saveFee}
            disabled={!feeInput || savingFee}
            className="rounded-none px-4 py-2 text-xs font-semibold text-white
              disabled:opacity-50"
            style={{ background: ACCENT }}
          >
            Set করুন
          </button>
        </div>
      </div>
    );
  }

  const rows = records || [];
  const columns = ["PAYMENT STATUS", "STUDENT", "FEES TYPE", "MONTH", "DUE DATE", "AMOUNT", "ACTION"];

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 text-sm">
          <button onClick={() => shiftMonth(-1)}
            className="grid h-8 w-8 place-items-center rounded hover:bg-slate-100">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="font-semibold text-slate-800">
            {month.toLocaleString("en-GB", { month: "long", year: "numeric" })}
          </span>
          <button onClick={() => shiftMonth(1)}
            className="grid h-8 w-8 place-items-center rounded hover:bg-slate-100">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {editingFee ? (
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={feeInput}
              onChange={(e) => setFeeInput(e.target.value)}
              className="w-28 rounded-none border border-slate-300 px-2.5 py-1.5 text-xs
                outline-none focus:border-[#6338f6]"
            />
            <button onClick={saveFee} disabled={savingFee}
              className="rounded-none px-3 py-1.5 text-xs font-semibold text-white"
              style={{ background: ACCENT }}>
              Save
            </button>
            <button onClick={() => { setEditingFee(false); setFeeInput(fee); }}
              className="rounded-none border border-slate-300 px-3 py-1.5 text-xs">
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setEditingFee(true)}
            className="flex items-center gap-1.5 rounded-none border border-slate-300
              bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Pencil className="h-3.5 w-3.5" />
            Monthly Fee: {fmtAmount(fee)}
          </button>
        )}
      </div>

      {records === null ? (
        <p className="text-sm text-slate-400">লোড হচ্ছে…</p>
      ) : (
        <FeeTable
          columns={columns}
          rows={rows.map((r) => (
            <tr key={r.id} className="hover:bg-slate-50 transition-colors">
              <td className={`px-4 py-3 font-medium ${STATUS_STYLE[r.status].cls}`}>
                {STATUS_STYLE[r.status].label}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <Avatar name={r.student_name} size="sm" />
                  <span className="truncate">{r.student_name}</span>
                </div>
              </td>
              <td className="px-4 py-3">Monthly Tuition</td>
              <td className="px-4 py-3">{fmtMonth(r.month)}</td>
              <td className="px-4 py-3">{dueDate(r.month, batch.payment_grace_day)}</td>
              <td className="px-4 py-3 font-semibold">{fmtAmount(r.amount)}</td>
              <td className="px-4 py-3 text-center">
                {r.status === "PENDING_VERIFICATION" ? (
                  <button
                    onClick={() => confirm(r.id)}
                    className="rounded-none px-3 py-1 text-[11px] font-semibold text-white"
                    style={{ background: ACCENT }}
                  >
                    Confirm
                  </button>
                ) : (
                  <button
                    onClick={() => toggle(r)}
                    className="rounded-none border border-slate-300 px-3 py-1 text-[11px]
                      font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    {r.status === "PAID" ? "Mark Due" : "Mark Paid"}
                  </button>
                )}
              </td>
            </tr>
          ))}
          page={page}
          setPage={setPage}
          onRefresh={loadRecords}
          refreshing={refreshing}
          emptyText="এই মাসে কোনো শিক্ষার্থীর record নেই।"
        />
      )}
    </div>
  );
}

/* ============================== STUDENT ============================== */

function StudentFeeView({ batch }) {
  const [allData, setAllData] = useState(null);
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [openForm, setOpenForm] = useState(null);
  const [trxId, setTrxId] = useState("");
  const [method, setMethod] = useState("BKASH");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    setRefreshing(true);
    client.get("/api/payments/my/").then((res) => setAllData(res.data))
      .finally(() => setRefreshing(false));
  };

  useEffect(load, []);

  const records = useMemo(
    () => (allData && batch?.name ? allData[batch.name] || [] : []),
    [allData, batch?.name]
  );

  const payWithGateway = async (recordId) => {
    try {
      const { data } = await client.post(`/api/payments/records/${recordId}/pay/`);
      window.location.href = data.gateway_url;
    } catch (err) {
      alert(err.response?.data?.detail || "Payment শুরু করা যায়নি।");
    }
  };

  const openSubmitForm = (recordId) => {
    setOpenForm(recordId);
    setTrxId("");
    setMethod("BKASH");
    setError("");
  };

  const submitPayment = async (recordId) => {
    if (!trxId.trim()) {
      setError("Transaction ID লিখুন।");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await client.post(`/api/payments/records/${recordId}/submit/`, {
        trx_id: trxId.trim(),
        method,
      });
      setOpenForm(null);
      load();
    } catch (err) {
      setError(err.response?.data?.detail || "জমা দেওয়া যায়নি।");
    } finally {
      setBusy(false);
    }
  };

  const dueTotal = records
    .filter((r) => r.status === "DUE")
    .reduce((n, r) => n + Number(r.amount || 0), 0);

  const columns = ["PAYMENT STATUS", "MONTH", "FEES TYPE", "DUE DATE", "AMOUNT", "ACTION"];

  if (allData === null) {
    return <p className="text-sm text-slate-400">লোড হচ্ছে…</p>;
  }

  return (
    <div className="space-y-4">
      {dueTotal > 0 && (
        <div className="border border-rose-200 bg-rose-50 px-4 py-3">
          <p className="text-xs text-rose-500">মোট বকেয়া</p>
          <p className="text-lg font-bold text-rose-700">{fmtAmount(dueTotal)}</p>
        </div>
      )}

      <FeeTable
        columns={columns}
        rows={records.map((r) => (
          <Fragment key={r.id}>
            <tr className="hover:bg-slate-50 transition-colors">
              <td className={`px-4 py-3 font-medium ${STATUS_STYLE[r.status].cls}`}>
                {STATUS_STYLE[r.status].label}
              </td>
              <td className="px-4 py-3">{fmtMonth(r.month)}</td>
              <td className="px-4 py-3">Monthly Tuition</td>
              <td className="px-4 py-3">{dueDate(r.month, batch?.payment_grace_day)}</td>
              <td className="px-4 py-3 font-semibold">{fmtAmount(r.amount)}</td>
              <td className="px-4 py-3 text-center">
                {r.status === "DUE" ? (
                  <div className="flex justify-center gap-1.5">
                    <button
                      onClick={() => payWithGateway(r.id)}
                      className="rounded-none px-3 py-1 text-[11px] font-semibold text-white"
                      style={{ background: ACCENT }}
                    >
                      Pay Now
                    </button>
                    <button
                      onClick={() => openSubmitForm(r.id)}
                      className="rounded-none border border-slate-300 px-3 py-1 text-[11px]
                        font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      TrxID
                    </button>
                  </div>
                ) : r.status === "PENDING_VERIFICATION" ? (
                  <span className="text-[11px] text-amber-600">
                    {r.submitted_trx_id ? `TrxID: ${r.submitted_trx_id}` : "যাচাই হচ্ছে"}
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-400">
                    {r.paid_at ? fmtDate(r.paid_at) : "—"}
                  </span>
                )}
              </td>
            </tr>
            {openForm === r.id && (
              <tr>
                <td colSpan={columns.length} className="bg-slate-50 px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {METHODS.map(([value, l]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setMethod(value)}
                        className={`rounded-none border px-2.5 py-1 text-[11px] ${
                          method === value
                            ? "border-[#6338f6] bg-white font-semibold text-[#6338f6]"
                            : "border-slate-300 text-slate-600"
                        }`}
                      >
                        {l}
                      </button>
                    ))}
                    <input
                      placeholder="Transaction ID"
                      value={trxId}
                      onChange={(e) => setTrxId(e.target.value)}
                      className="min-w-[160px] flex-1 rounded-none border border-slate-300
                        px-2.5 py-1.5 text-xs outline-none focus:border-[#6338f6]"
                    />
                    <button
                      onClick={() => submitPayment(r.id)}
                      disabled={busy}
                      className="rounded-none px-3 py-1.5 text-[11px] font-semibold
                        text-white disabled:opacity-50"
                      style={{ background: ACCENT }}
                    >
                      জমা দিন
                    </button>
                    <button
                      onClick={() => setOpenForm(null)}
                      className="rounded-none border border-slate-300 px-3 py-1.5 text-[11px]"
                    >
                      বাতিল
                    </button>
                  </div>
                  {error && <p className="mt-1.5 text-[11px] text-rose-600">{error}</p>}
                </td>
              </tr>
            )}
          </Fragment>
        ))}
        page={page}
        setPage={setPage}
        onRefresh={load}
        refreshing={refreshing}
        emptyText="এখনো কোনো বেতনের হিসাব নেই।"
      />
    </div>
  );
}

/* ============================== PAGE ============================== */

export default function FeePage() {
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
      title={isTeacher ? t("fee") : t("myFee")}
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
      <div className="-m-3 md:-m-6 min-h-[calc(100dvh-3.5rem)] space-y-4 bg-slate-50/50 p-4 sm:p-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link
            to={roomPath}
            state={{ batch }}
            className="flex items-center gap-1 hover:text-[#6338f6] transition-colors"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            {batch ? batch.name : t("batches")}
          </Link>
          <span>/</span>
          <span className="font-medium text-slate-700">
            {isTeacher ? t("fee") : t("myFee")}
          </span>
        </div>

        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {isTeacher ? "Fee Management" : "My Fee"}
          </h1>
          {batch && (
            <p className="mt-0.5 text-xs text-slate-500">
              {batch.name}{batch.subject ? ` · ${batch.subject}` : ""}
            </p>
          )}
        </div>

        {/* Content */}
        {!batch ? (
          <p className="text-sm text-slate-400">লোড হচ্ছে…</p>
        ) : isTeacher ? (
          <TeacherFeeView batch={batch} />
        ) : (
          <StudentFeeView batch={batch} />
        )}
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
