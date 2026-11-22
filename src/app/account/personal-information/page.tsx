import type { Metadata } from "next";
import { AccountShell } from "@/components/account/AccountShell";
import { requireCustomer } from "@/server/require-auth";
import { ProfileForm } from "./ProfileForm";

export const metadata: Metadata = { title: "Personal information", robots: { index: false } };

export default async function PersonalInformationPage() {
  const c = await requireCustomer("/account/personal-information");
  return (
    <AccountShell eyebrow="My account / Personal information" title="Personal Information" lead="Manage your personal details and keep your account information up to date.">
      <ProfileForm email={c.email} defaults={{ firstName: c.first_name ?? "", lastName: c.last_name ?? "", phone: c.phone ?? "" }} />
    </AccountShell>
  );
}
