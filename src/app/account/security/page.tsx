import type { Metadata } from "next";
import { AccountShell, accountStyles as s } from "@/components/account/AccountShell";
import { sessionCount } from "@/server/auth";
import { requireCustomer } from "@/server/require-auth";
import { ChangePasswordForm, SessionControls } from "./SecurityForms";

export const metadata: Metadata = { title: "Account security", robots: { index: false } };

/** Not designed in Figma (implementation gap) — composed from the approved account panels and form components. */
export default async function SecurityPage() {
  const c = await requireCustomer("/account/security");
  const others = Math.max(0, sessionCount(c.id) - 1);
  return (
    <AccountShell eyebrow="My account / Account security" title="Account Security" lead="Update your password or manage your session.">
      <div className={s.panel}>
        <div className={s.panelHead}>
          <h2 className={s.panelTitle}>Change password</h2>
        </div>
        <ChangePasswordForm />
      </div>
      <div className={s.panel}>
        <div className={s.panelHead}>
          <h2 className={s.panelTitle}>Sessions</h2>
        </div>
        <SessionControls otherSessions={others} />
      </div>
    </AccountShell>
  );
}
