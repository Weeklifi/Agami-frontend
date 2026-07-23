import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
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
import ExamList from "./ExamList";
import ExamSheet from "./ExamSheet";
import Leaderboard from "./Leaderboard";

export default function BatchModals({ batch, isTeacher, tool, onClose }) {
  const { t } = useTranslation();
  const [students, setStudents] = useState(null);
  const [attTab, setAttTab] = useState("sheet");
  const [examView, setExamView] = useState({ mode: "list", exam: null });
  const [copied, setCopied] = useState(false);

  // Students modal খুললে একবার load
  useEffect(() => {
    if (tool === "students" && students === null) {
      client
        .get(`/api/batches/${batch.id}/students/`)
        .then((res) => setStudents(res.data))
        .catch(() => setStudents([]));
    }
    if (tool === "results") setExamView({ mode: "list", exam: null });
  }, [tool, batch.id, students]);

  // Invite code — modal না, সরাসরি কপি
  useEffect(() => {
    if (tool !== "code") return;
    navigator.clipboard.writeText(batch.invite_code).then(() => {
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        onClose();
      }, 1200);
    });
  }, [tool, batch.invite_code, onClose]);

  return (
    <>
      {/* কপি হয়েছে — ছোট toast */}
      {copied && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50
          rounded-full bg-ink-900 px-4 py-2 text-xs text-white shadow-lg">
          ✓ {t("copied")} — {batch.invite_code}
        </div>
      )}

      {/* Students */}
      <Modal
        open={tool === "students"}
        onClose={onClose}
        title={`${t("students")} (${batch.student_count})`}
      >
        {students === null ? (
          <p className="text-sm text-ink-400 text-center py-8">{t("loading")}</p>
        ) : students.length === 0 ? (
          <p className="text-sm text-ink-400 text-center py-12">
            {t("noStudents")}
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {students.map((s) => (
              <li key={s.id} className="flex items-center gap-3 py-3">
                <Avatar name={s.student_name} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">
                    {s.student_name}
                  </p>
                  <p className="text-xs text-ink-400 truncate">
                    {s.student_email}
                  </p>
                </div>
                <Badge tone="ok">{t("active")}</Badge>
              </li>
            ))}
          </ul>
        )}
      </Modal>

      {/* Invite */}
      {isTeacher && (
        <InviteModal
          open={tool === "invite"}
          onClose={onClose}
          batchId={batch.id}
        />
      )}

      {/* Routine */}
      <RoutineSheet
        open={tool === "routine"}
        onClose={onClose}
        batchId={batch.id}
        isTeacher={isTeacher}
      />

      {/* Fee */}
      <Modal
        open={tool === "fee"}
        onClose={onClose}
        title={isTeacher ? t("fee") : t("myFee")}
      >
        {isTeacher ? (
          <FeeSheetTeacher batchId={batch.id} />
        ) : (
          <FeeSheetStudent batchName={batch.name} />
        )}
      </Modal>

      {/* Attendance */}
      <Modal
        open={tool === "attendance"}
        onClose={onClose}
        title={isTeacher ? t("attendance") : t("myAttendance")}
        wide={isTeacher}
      >
        {isTeacher ? (
          <>
            <div className="flex gap-1 border-b border-line mb-4">
              {[
                ["sheet", t("takeAttendance")],
                ["report", t("monthlyReport")],
              ].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setAttTab(key)}
                  className={`px-4 py-2 text-sm transition-colors
                    ${attTab === key
                      ? "border-b-2 border-brand-600 font-medium text-brand-600"
                      : "text-ink-600 hover:text-ink-900"
                    }`}
                >
                  {label}
                </button>
              ))}
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

      {/* Results */}
      <Modal open={tool === "results"} onClose={onClose} title={t("results")} wide>
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