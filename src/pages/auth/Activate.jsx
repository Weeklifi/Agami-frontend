import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import client from "../../api/client";
import AuthLayout from "../../components/AuthLayout";
import Button from "../../components/ui/Button";

export default function Activate() {
  const { uid, token } = useParams();
  const [status, setStatus] = useState("loading"); // loading | ok | fail
  const fired = useRef(false); // StrictMode-এর double-run guard

  useEffect(() => {
    if (fired.current) return; // দ্বিতীয়বার এলে কিছু কোরো না
    fired.current = true;

    client
      .post("/api/auth/users/activation/", { uid, token })
      .then(() => setStatus("ok"))
      .catch(() => setStatus("fail"));
  }, [uid, token]);

  return (
    <AuthLayout title="Account Activation">
      {status === "loading" && (
        <div className="flex flex-col items-center gap-3 py-2 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
          <p className="text-sm text-ink-600">যাচাই করা হচ্ছে…</p>
        </div>
      )}
      {status === "ok" && (
        <div className="space-y-4 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl
            bg-emerald-50 text-ok">
            <CheckCircle2 className="h-9 w-9" strokeWidth={2} />
          </div>
          <p className="text-base font-bold text-ok">আপনার account চালু হয়েছে!</p>
          <Link to="/login">
            <Button>Login করুন</Button>
          </Link>
        </div>
      )}
      {status === "fail" && (
        <div className="space-y-4 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl
            bg-red-50 text-err">
            <XCircle className="h-9 w-9" strokeWidth={2} />
          </div>
          <p className="text-sm text-ink-600">
            Link-টি invalid বা expired। যদি আগেই activate করে থাকেন, সরাসরি{" "}
            <Link to="/login" className="text-brand-600 hover:underline font-medium">
              login করুন
            </Link>
            ।
          </p>
        </div>
      )}
    </AuthLayout>
  );
}
