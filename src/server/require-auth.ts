import "server-only";
import { redirect } from "next/navigation";
import { currentCustomer, currentSessionToken, type Customer } from "./auth";

/** Server-side guard for protected pages. Distinguishes "expired" from "never signed in". */
export async function requireCustomer(nextPath: string): Promise<Customer> {
  const customer = await currentCustomer();
  if (customer) return customer;
  const hadSession = Boolean(await currentSessionToken());
  redirect(`/login?next=${encodeURIComponent(nextPath)}${hadSession ? "&notice=expired" : ""}`);
}
