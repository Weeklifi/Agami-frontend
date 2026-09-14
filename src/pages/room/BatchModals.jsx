import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import InviteModal from "../teacher/InviteModal";

export default function BatchModals({ batch, isTeacher, tool, onClose }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

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

      {/* Invite */}
      {isTeacher && (
        <InviteModal
          open={tool === "invite"}
          onClose={onClose}
          batchId={batch.id}
        />
      )}

    </>
  );
}