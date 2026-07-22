import { useLocation } from "react-router-dom";
import AuthLayout from "../../components/AuthLayout";

export default function CheckEmail() {
  const email = useLocation().state?.email;

  return (
    <AuthLayout title="Email চেক করুন">
      <p className="text-sm text-ink-600 leading-relaxed text-center">
        {email ? (
          <>
            <span className="font-medium text-ink-900">{email}</span>-এ একটি
            activation link পাঠানো হয়েছে।
          </>
        ) : (
          "আপনার email-এ একটি activation link পাঠানো হয়েছে।"
        )}{" "}
        Link-এ ক্লিক করে account চালু করুন।
      </p>
    </AuthLayout>
  );
}