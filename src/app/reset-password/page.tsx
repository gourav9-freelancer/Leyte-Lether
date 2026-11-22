import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Set a new password", robots: { index: false }, referrer: "no-referrer" };

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const token = (await searchParams).token ?? "";
  const valid = /^[A-Za-z0-9_-]{20,200}$/.test(token);
  return (
    <AuthLayout eyebrow="Account security" title="Set a new password." lead="Choose a new password for your Leyte Leather account.">
      {valid ? (
        <ResetPasswordForm token={token} />
      ) : (
        <Alert tone="error" title="This reset link is invalid or has expired." actions={<Button href="/forgot-password" variant="secondary" compact>Request a new link</Button>}>
          Reset links can only be used once and expire after 30 minutes.
        </Alert>
      )}
    </AuthLayout>
  );
}
