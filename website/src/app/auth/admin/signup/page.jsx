import AuthLayout from "../../../../components/auth/AuthLayout/AuthLayout";
import AdminSignupForm from "../../../../components/admin/AdminSignupForm";

export const metadata = {
  title: "Request admin access",
  robots: { index: false, follow: false },
};

export default function AdminSignupPage() {
  return (
    <AuthLayout
      eyebrow="ADMINISTRATION"
      title="Request access"
      description="Create an account request. Admin permissions are granted separately in Supabase."
      alternateHref="/auth/admin/login"
      alternatePrompt="Already approved?"
      alternateLabel="Sign in"
    >
      <AdminSignupForm />
    </AuthLayout>
  );
}
