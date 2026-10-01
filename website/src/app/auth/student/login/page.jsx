import AuthLayout from "../../../../components/auth/AuthLayout/AuthLayout";
import LoginForm from "../../../../components/auth/LoginForm/LoginForm";

export const metadata = {
  title: "Student sign in | Innoknowvex",
  description: "Sign in to your Innoknowvex student account.",
};

export default function StudentLoginPage() {
  return (
    <AuthLayout
      eyebrow="WELCOME BACK"
      title="Sign in to continue"
      description="Access your learning and career journey."
      alternateHref="/auth/student/signup"
      alternatePrompt="New here?"
      alternateLabel="Create an account"
    >
      <LoginForm />
    </AuthLayout>
  );
}