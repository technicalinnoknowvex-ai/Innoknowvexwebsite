import AuthLayout from "../../../../components/auth/AuthLayout/AuthLayout";
import SignupForm from "../../../../components/auth/SignupForm/SignupForm";

export const metadata = {
  title: "Student account | Innoknowvex",
  description: "Create an Innoknowvex student account.",
};

export default function StudentSignupPage() {
  return (
    <AuthLayout
      eyebrow="GET STARTED"
      title="Create your account"
      description="A few details are all you need to get started."
      alternateHref="/auth/student/login"
      alternatePrompt="Already registered?"
      alternateLabel="Sign in"
    >
      <SignupForm />
    </AuthLayout>
  );
}