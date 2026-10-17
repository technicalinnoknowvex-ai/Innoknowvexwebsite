import AuthLayout from "../../../../components/auth/AuthLayout/AuthLayout";
import AdminLoginForm from "../../../../components/admin/AdminLoginForm";

export const metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({ searchParams }) {
  const params = searchParams ? await searchParams : {};
  return (
    <AuthLayout
      eyebrow="ADMINISTRATION"
      title="Admin sign in"
      description="Sign in with an account approved for admin access."
      alternateHref="/"
      alternatePrompt="Innoknowvex"
      alternateLabel="Home"
    >
      <AdminLoginForm accessPending={params.access === "pending"} />
    </AuthLayout>
  );
}
