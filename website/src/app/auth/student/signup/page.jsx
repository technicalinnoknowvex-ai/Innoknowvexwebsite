import AuthLayout from "../../../../components/auth/AuthLayout/AuthLayout";
import SignupForm from "../../../../components/auth/SignupForm/SignupForm";

export const metadata = {
  title: "Student account | Innoknowvex",
  description: "Create an Innoknowvex student account.",
};

export default async function StudentSignupPage({ searchParams }) {
  const params = searchParams ? await searchParams : {};
  const redirectTo = typeof params.next === "string" ? params.next : "";
  const alternateHref = redirectTo
    ? `/auth/student/login?next=${encodeURIComponent(redirectTo)}`
    : "/auth/student/login";

  return (
    <AuthLayout
      eyebrow="GET STARTED"
      title="Create your account"
      description="A few details are all you need to get started."
      alternateHref={alternateHref}
      alternatePrompt="Already registered?"
      alternateLabel="Sign in"
    >
      <SignupForm redirectTo={redirectTo} />
    </AuthLayout>
  );
}