import { useState } from "react";
import client from "../../api/client";
import Modal from "../../components/ui/Modal";
import Badge from "../../components/ui/Badge";
import Avatar from "../../components/ui/Avatar";
import InviteModal from "../teacher/InviteModal";
import RoutineSheet from "./RoutineSheet";
import FeeSheetTeacher from "./FeeSheetTeacher";
import FeeSheetStudent from "./FeeSheetStudent";
import AttendanceSheet from "./AttendanceSheet";
import AttendanceReport from "./AttendanceReport";
import AttendanceStudent from "./AttendanceStudent";
import { useTranslation } from "react-i18next";
import ExamList from "./ExamList";
import ExamSheet from "./ExamSheet";
import Leaderboard from "./Leaderboard";

function ActionChip({ onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold
        border border-gray-200 bg-white text-gray-700
        hover:border-gray-400 hover:bg-gray-50 hover:text-gray-900
        transition-all duration-200 shadow-sm hover:shadow
        whitespace-nowrap flex-shrink-0"
    >
      {children}
    </button>
  );
}

export default function BatchActionBar({ batch, isTeacher }) {
  const [copied, setCopied] = useState(false);
  const [studentsOpen, setStudentsOpen] = useState(false);
  const [students, setStudents] = useState(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [routineOpen, setRoutineOpen] = useState(false);
  const [feeOpen, setFeeOpen] = useState(false);
  const [attendanceOpen, setAttendanceOpen] = useState(false);
  const [attTab, setAttTab] = useState("sheet"); // sheet | report
  const { t } = useTranslation();
  
  // Exam states
  const [examOpen, setExamOpen] = useState(false);
  const [examView, setExamView] = useState({ mode: "list", exam: null });
  // mode: list | sheet | board

  const copyCode = async () => {
    await navigator.clipboard.writeText(batch.invite_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openStudents = () => {
    setStudentsOpen(true);
    if (students === null) {
      client
        .get(`/api/batches/${batch.id}/students/`)
        .then((res) => setStudents(res.data));
    }
  };

  return (
    <>
      <div className="flex gap-1.5 flex-wrap">
        {isTeacher && (
          <>
            <ActionChip onClick={copyCode}>
              {copied ? (
                <>
                  <svg className="h-4 w-4 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{t("copied")}</span>
                </>
              ) : (
                <>
                  <svg className="h-4 w-4 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  <span className="font-mono">{batch.invite_code}</span>
                </>
              )}
            </ActionChip>

            <ActionChip onClick={() => setInviteOpen(true)}>
              <svg className="h-4 w-4 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>{t("emailInvite")}</span>
            </ActionChip>

            <ActionChip onClick={openStudents}>
              <svg className="h-4 w-4 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span>{batch.student_count} {t("students")}</span>
            </ActionChip>
          </>
        )}

        {/* হাজিরা — teacher ও student দুজনেই */}
        <ActionChip onClick={() => setAttendanceOpen(true)}>
          <svg className="h-4 w-4 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          <span>{isTeacher ? t("attendance") : t("myAttendance")}</span>
        </ActionChip>

        {/* Results Chip */}
        <ActionChip onClick={() => { setExamView({ mode: "list", exam: null }); setExamOpen(true); }}>
          <svg className="h-4 w-4 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
          <span>{t("results")}</span>
        </ActionChip>

        <ActionChip onClick={() => setRoutineOpen(true)}>
          <svg className="h-4 w-4 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>{t("routine")}</span>
        </ActionChip>

        <ActionChip onClick={() => setFeeOpen(true)}>
          <svg className="h-4 w-4 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{isTeacher ? t("fee") : t("myFee")}</span>
        </ActionChip>
      </div>

      {/* Students Modal */}
      <Modal
        open={studentsOpen}
        onClose={() => setStudentsOpen(false)}
        title={`${t("students")} (${batch.student_count})`}
      >
        {students === null ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex space-x-2">
              <div className="w-2.5 h-2.5 bg-gray-400 animate-bounce" style={{ animationDelay: "0s" }} />
              <div className="w-2.5 h-2.5 bg-gray-500 animate-bounce" style={{ animationDelay: "0.2s" }} />
              <div className="w-2.5 h-2.5 bg-gray-600 animate-bounce" style={{ animationDelay: "0.4s" }} />
            </div>
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-12">
            <svg className="h-16 w-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-base font-medium text-gray-600">{t("noStudents")}</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {students.map((s) => (
              <li key={s.id} className="flex items-center gap-4 py-3.5">
                <Avatar name={s.student_name} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="text-base font-semibold text-gray-800 truncate">
                    {s.student_name}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {s.student_email}
                  </p>
                </div>
                <Badge tone="ok">{t("active")}</Badge>
              </li>
            ))}
          </ul>
        )}
      </Modal>

      {isTeacher && (
        <InviteModal
          open={inviteOpen}
          onClose={() => setInviteOpen(false)}
          batchId={batch.id}
        />
      )}

      <RoutineSheet
        open={routineOpen}
        onClose={() => setRoutineOpen(false)}
        batchId={batch.id}
        isTeacher={isTeacher}
      />

      {/* Fee Modal */}
      <Modal
        open={feeOpen}
        onClose={() => setFeeOpen(false)}
        title={isTeacher ? t("fee") : t("myFee")}
      >
        {isTeacher ? (
          <FeeSheetTeacher batchId={batch.id} />
        ) : (
          <FeeSheetStudent batchName={batch.name} />
        )}
      </Modal>

      {/* Attendance Modal — teacher: দুই tab, student: নিজের হিসাব */}
      <Modal
        open={attendanceOpen}
        onClose={() => setAttendanceOpen(false)}
        title={isTeacher ? t("attendance") : t("myAttendance")}
        wide={isTeacher}
      >
        {isTeacher ? (
          <>
            <div className="flex gap-1 border-b border-line mb-4">
              <button
                onClick={() => setAttTab("sheet")}
                className={`px-4 py-2 text-sm transition-colors
                  ${
                    attTab === "sheet"
                      ? "border-b-2 border-brand-600 font-medium text-brand-600"
                      : "text-ink-600 hover:text-ink-900"
                  }`}
              >
                {t("takeAttendance")}
              </button>
              <button
                onClick={() => setAttTab("report")}
                className={`px-4 py-2 text-sm transition-colors
                  ${
                    attTab === "report"
                      ? "border-b-2 border-brand-600 font-medium text-brand-600"
                      : "text-ink-600 hover:text-ink-900"
                  }`}
              >
                {t("monthlyReport")}
              </button>
            </div>

            {attTab === "sheet" ? (
              <AttendanceSheet batchId={batch.id} />
            ) : (
              <AttendanceReport batchId={batch.id} />
            )}
          </>
        ) : (
          <AttendanceStudent batchId={batch.id} />
        )}
      </Modal>

      {/* Results / Leaderboard Modal */}
      <Modal
        open={examOpen}
        onClose={() => setExamOpen(false)}
        title={t("results")}
        wide
      >
        {examView.mode === "list" && (
          <ExamList
            batchId={batch.id}
            isTeacher={isTeacher}
            onOpenSheet={(ex) => setExamView({ mode: "sheet", exam: ex })}
            onOpenBoard={(ex) => setExamView({ mode: "board", exam: ex })}
          />
        )}
        {examView.mode === "sheet" && (
          <ExamSheet
            exam={examView.exam}
            onBack={() => setExamView({ mode: "list", exam: null })}
          />
        )}
        {examView.mode === "board" && (
          <Leaderboard
            exam={examView.exam}
            isTeacher={isTeacher}
            onBack={() => setExamView({ mode: "list", exam: null })}
          />
        )}
      </Modal>
    </>
  );
}