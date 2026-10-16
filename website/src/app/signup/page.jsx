import AuthLayout from "../../components/auth/AuthLayout/AuthLayout";
import SignupForm from "../../components/auth/SignupForm/SignupForm";

export const metadata = {
  title: "Create account",
  description: "Create an Innoknowvex account to get started.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function SignupPage() {
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