import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { BookOpen, GraduationCap } from "lucide-react";
import client, { tokenStore } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import AuthLayout from "../../components/AuthLayout";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

export default function JoinPage() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  const [invite, setInvite] = useState(null);   // {batch, email, user_exists}
  const [status, setStatus] = useState("loading"); // loading | ready | invalid
  const [form, setForm] = useState({ first_name: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      return;
    }
    client
      .get(`/api/batches/invitations/${token}/`)
      .then((res) => {
        setInvite(res.data);
        setStatus("ready");
      })
      .catch(() => setStatus("invalid"));
  }, [token]);

  // নতুন user: signup + auto-join + auto-login
  const signup = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const { data } = await client.post("/api/batches/join/invited-signup/", {
        token,
        password: form.password,
        first_name: form.first_name,
      });
      tokenStore.set(data.access, data.refresh);
      setUser(data.user);
      navigate("/student/batches", { replace: true });
    } catch (err) {
      const d = err.response?.data;
      setError(d?.password?.[0] || d?.token?.[0] || d?.detail || "ব্যর্থ হয়েছে।");
    } finally {
      setBusy(false);
    }
  };

  // Existing + logged-in user: শুধু accept
  const accept = async () => {
    setBusy(true);
    setError("");
    try {
      await client.post(`/api/batches/invitations/${token}/accept/`);
      // Role এইমাত্র STUDENT হয়ে থাকতে পারে — me refresh করো
      const me = await client.get("/api/auth/users/me/");
      setUser(me.data);
      navigate("/student/batches", { replace: true });
    } catch (err) {
      setError(err.response?.data?.detail || "Accept করা যায়নি।");
    } finally {
      setBusy(false);
    }
  };

  if (status === "loading")
    return (
      <AuthLayout title="Invitation">
        <p className="text-center text-sm text-ink-600">যাচাই হচ্ছে…</p>
      </AuthLayout>
    );

  if (status === "invalid")
    return (
      <AuthLayout title="Invitation">
        <p className="text-center text-sm text-err">
          এই invitation-টি invalid, expired বা আগেই ব্যবহৃত। আপনার শিক্ষককে
          নতুন invitation পাঠাতে বলুন।
        </p>
      </AuthLayout>
    );

  const batchInfo = (
    <div className="mb-5 rounded-2xl border border-brand-100 bg-brand-50 p-4 text-center">
      <div className="mx-auto mb-2 grid h-11 w-11 place-items-center rounded-xl
        bg-white text-brand-600 shadow-soft">
        <BookOpen className="h-5 w-5" />
      </div>
      <p className="text-xs text-ink-600">আপনাকে আমন্ত্রণ জানানো হয়েছে</p>
      <p className="mt-1 font-bold">{invite.batch.name}</p>
      <p className="flex items-center justify-center gap-1 text-xs text-ink-600">
        <GraduationCap className="h-3.5 w-3.5" /> {invite.batch.teacher_name}
      </p>
    </div>
  );

  // অবস্থা ৩: logged in — শুধু confirm
  if (user) {
    const emailMatches =
      user.email.toLowerCase() === invite.email.toLowerCase();
    return (
      <AuthLayout title="Batch-এ Join করুন">
        {batchInfo}
        {emailMatches ? (
          <>
            {error && <p className="mb-3 text-sm text-err">{error}</p>}
            <Button onClick={accept} loading={busy}>
              Join করুন
            </Button>
          </>
        ) : (
          <p className="text-center text-sm text-warn">
            এই invitation-টি{" "}
            <span className="font-medium">{invite.email}</span>-এর জন্য, কিন্তু
            আপনি {user.email} দিয়ে logged in। সঠিক account দিয়ে login করুন।
          </p>
        )}
      </AuthLayout>
    );
  }

  // অবস্থা ২: user আছে কিন্তু logged out
  if (invite.user_exists) {
    return (
      <AuthLayout title="Batch-এ Join করুন">
        {batchInfo}
        <p className="mb-4 text-center text-sm text-ink-600">
          <span className="font-medium">{invite.email}</span>-এ account আছে।
          Login করে join করুন।
        </p>
        <Link to={`/login?next=/join?token=${token}`}>
          <Button>Login করুন</Button>
        </Link>
      </AuthLayout>
    );
  }

  // অবস্থা ১: নতুন user — signup form
  return (
    <AuthLayout title="Account তৈরি করে Join করুন">
      {batchInfo}
      <form onSubmit={signup} className="space-y-4">
        <Input label="Email" value={invite.email} disabled />
        <Input
          label="আপনার নাম"
          placeholder="রহিম"
          value={form.first_name}
          onChange={(e) => setForm({ ...form, first_name: e.target.value })}
        />
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        {error && <p className="text-sm text-err">{error}</p>}
        <Button type="submit" loading={busy}>
          Account তৈরি করুন ও Join করুন
        </Button>
        <p className="text-center text-xs text-ink-400">
          Email verification লাগবে না — invitation-ই যথেষ্ট
        </p>
      </form>
    </AuthLayout>
  );
}