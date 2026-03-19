// --- Disposable / temporary email domain blocklist ---
const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com",
  "guerrillamail.com",
  "guerrillamail.net",
  "guerrillamail.org",
  "guerrillamail.de",
  "grr.la",
  "guerrillamailblock.com",
  "tempmail.com",
  "temp-mail.org",
  "temp-mail.io",
  "throwaway.email",
  "throwaway.com",
  "yopmail.com",
  "yopmail.fr",
  "yopmail.net",
  "dispostable.com",
  "sharklasers.com",
  "trashmail.com",
  "trashmail.me",
  "trashmail.net",
  "trashmail.org",
  "trashmail.io",
  "10minutemail.com",
  "10minutemail.net",
  "minutemail.com",
  "tempail.com",
  "tempr.email",
  "discard.email",
  "mailnesia.com",
  "maildrop.cc",
  "mailcatch.com",
  "mailnull.com",
  "getairmail.com",
  "filzmail.com",
  "inboxbear.com",
  "spamgourmet.com",
  "safetymail.info",
  "trashymail.com",
  "mailexpire.com",
  "tempinbox.com",
  "fakeinbox.com",
  "guerrillamail.info",
  "spam4.me",
  "binkmail.com",
  "bobmail.info",
  "burnthismail.com",
  "curryworld.de",
  "dayrep.com",
  "devnullmail.com",
  "emailigo.de",
  "emailsensei.com",
  "emailtemporario.com.br",
  "ephemail.net",
  "gishpuppy.com",
  "harakirimail.com",
  "jetable.org",
  "kasmail.com",
  "koszmail.pl",
  "kurzepost.de",
  "mailblocks.com",
  "mailforspam.com",
  "mailfreeonline.com",
  "mailimate.com",
  "mailmoat.com",
  "mailscrap.com",
  "mailshell.com",
  "mailsiphon.com",
  "mailslite.com",
  "mailzilla.com",
  "nomail.xl.cx",
  "nospam.ze.tc",
  "owlpic.com",
  "proxymail.eu",
  "rcpt.at",
  "rejectmail.com",
  "safersignup.de",
  "spamavert.com",
  "spamfree24.org",
  "spamhereplease.com",
  "tempomail.fr",
  "thankyou2010.com",
  "trashemail.de",
  "wegwerfmail.de",
  "wegwerfmail.net",
  "wh4f.org",
  "mailsac.com",
  "mohmal.com",
  "getnada.com",
  "tempmailo.com",
  "emailondeck.com",
  "crazymailing.com",
  "mailpoof.com",
]);

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function getDomain(email: string): string {
  return email.split("@")[1] ?? "";
}

function isDisposableEmail(email: string): boolean {
  return DISPOSABLE_DOMAINS.has(getDomain(email.toLowerCase()));
}

/**
 * Client-side email validation (no DNS — works in browser).
 * Returns an error message string, or null if valid.
 */
export function validateEmailClient(email: string): string | null {
  const trimmed = email.trim().toLowerCase();

  if (!trimmed) return "Email requis.";
  if (trimmed.length > 254) return "Email trop long.";
  if (!EMAIL_REGEX.test(trimmed)) return "Format d'email invalide.";
  if (isDisposableEmail(trimmed)) return "Les adresses email temporaires ne sont pas acceptées.";

  return null;
}
