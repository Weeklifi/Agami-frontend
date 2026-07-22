import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
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
        <p className="text-center text-sm text-ink-600">যাচাই করা হচ্ছে…</p>
      )}
      {status === "ok" && (
        <div className="space-y-4 text-center">
          <p className="text-sm text-ok font-medium">
            ✓ আপনার account চালু হয়েছে!
          </p>
          <Link to="/login">
            <Button>Login করুন</Button>
          </Link>
        </div>
      )}
      {status === "fail" && (
        <p className="text-center text-sm text-err">
          Link-টি invalid বা expired। যদি আগেই activate করে থাকেন, সরাসরি{" "}
          <Link to="/login" className="text-brand-600 hover:underline font-medium">
            login করুন
          </Link>
          ।
        </p>
      )}
    </AuthLayout>
  );
}