import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthLayout, authStyles } from "@/components/auth/AuthLayout";
import { LoginForm } from "@/components/auth/LoginForm";
import { Button } from "@/components/ui/Button";
import { safeNext } from "@/lib/safe-redirect";
import { currentCustomer } from "@/server/auth";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

/** Sign-in state of the approved My Account frame (1:2878). */
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; notice?: string }> }) {
  const sp = await searchParams;
  const next = safeNext(sp.next);
  if (await currentCustomer()) redirect(next);
  const notice = sp.notice === "expired" || sp.notice === "reset" || sp.notice === "signed-out" ? sp.notice : null;
  return (
    <AuthLayout eyebrow="Your Leyte Leather account" title="Welcome back." lead="Sign in to access your account, manage your details and keep track of your orders.">
      <LoginForm next={next} notice={notice} />
      <div className={authStyles.secondary}>
        <h2 className={authStyles.secondaryTitle}>New to Leyte Leather?</h2>
        <p className={authStyles.secondaryText}>Create an account to manage your details and access your orders.</p>
        <Button href={`/register${sp.next ? `?next=${encodeURIComponent(next)}` : ""}`} variant="secondary" fullWidth>
          Create an Account
        </Button>
      </div>
    </AuthLayout>
  );
}
