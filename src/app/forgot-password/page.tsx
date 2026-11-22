import type { Metadata } from "next";
import Link from "next/link";
import { AuthLayout, authStyles } from "@/components/auth/AuthLayout";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = { title: "Forgot password", robots: { index: false } };

export default function ForgotPasswordPage() {
  return (
    <AuthLayout eyebrow="Account security" title="Reset your password." lead="Enter the email address for your account and we'll send you a secure reset link.">
      <ForgotPasswordForm />
      <p className={authStyles.secondaryText} style={{ textAlign: "center", margin: 0 }}>
        <Link href="/login" className={authStyles.link}>
          Back to sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
