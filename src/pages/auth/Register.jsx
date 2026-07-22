import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import client from "../../api/client";
import AuthLayout from "../../components/AuthLayout";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      await client.post("/api/auth/users/", form);
      navigate("/check-email", { state: { email: form.email } });
    } catch (err) {
      setErrors(err.response?.data || { detail: "কিছু একটা ভুল হয়েছে।" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Account তৈরি করুন"
      subtitle="কোচিং পরিচালনা হোক আরও সহজ"
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="নাম"
            placeholder="রহিম"
            value={form.first_name}
            onChange={set("first_name")}
            error={errors.first_name?.[0]}
          />
          <Input
            label="পদবি"
            placeholder="উদ্দিন"
            value={form.last_name}
            onChange={set("last_name")}
            error={errors.last_name?.[0]}
          />
        </div>
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={set("email")}
          error={errors.email?.[0]}
        />
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          value={form.password}
          onChange={set("password")}
          error={errors.password?.[0]}
        />
        {errors.detail && <p className="text-sm text-err">{errors.detail}</p>}
        <Button type="submit" loading={loading}>
          Account তৈরি করুন
        </Button>
      </form>
      <p className="mt-5 text-center text-sm text-ink-600">
        আগে থেকেই account আছে?{" "}
        <Link to="/login" className="font-medium text-brand-600 hover:underline">
          Login করুন
        </Link>
      </p>
    </AuthLayout>
  );
}