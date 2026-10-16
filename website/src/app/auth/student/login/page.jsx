import AuthLayout from "../../../../components/auth/AuthLayout/AuthLayout";
import LoginForm from "../../../../components/auth/LoginForm/LoginForm";

export const metadata = {
  title: "Student sign in",
  description: "Sign in to your Innoknowvex student account.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function StudentLoginPage({ searchParams }) {
  const params = searchParams ? await searchParams : {};
  const redirectTo = typeof params.next === "string" ? params.next : "";
  const alternateHref = redirectTo
    ? `/auth/student/signup?next=${encodeURIComponent(redirectTo)}`
    : "/auth/student/signup";

  return (
    <AuthLayout
      eyebrow="WELCOME BACK"
      title="Sign in to continue"
      description="Access your learning and career journey."
      alternateHref={alternateHref}
      alternatePrompt="New here?"
      alternateLabel="Create an account"
    >
      <LoginForm
        redirectTo={redirectTo}
        verificationPending={params.verification === "pending"}
      />
    </AuthLayout>
  );
}