import { resolve } from "dns/promises";

export { validateEmailClient } from "./emailValidation.client";

/**
 * Server-side: verify that the email domain has valid MX records.
 * Returns true if MX records exist, false otherwise.
 */
export async function hasMxRecords(email: string): Promise<boolean> {
  const domain = email.toLowerCase().split("@")[1] ?? "";
  if (!domain) return false;

  try {
    const records = await resolve(domain, "MX");
    return Array.isArray(records) && records.length > 0;
  } catch {
    return false;
  }
}
