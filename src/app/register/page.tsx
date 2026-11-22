import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthLayout, authStyles } from "@/components/auth/AuthLayout";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { safeNext } from "@/lib/safe-redirect";
import { currentCustomer } from "@/server/auth";

export const metadata: Metadata = { title: "Create an account", robots: { index: false } };

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = safeNext((await searchParams).next);
  if (await currentCustomer()) redirect(next);
  return (
    <AuthLayout eyebrow="Your Leyte Leather account" title="Create an account." lead="Manage your details and keep track of your orders in one place.">
      <RegisterForm next={next} />
      <p className={authStyles.secondaryText} style={{ textAlign: "center", margin: 0 }}>
        Already have an account?{" "}
        <Link href="/login" className={authStyles.link}>
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
