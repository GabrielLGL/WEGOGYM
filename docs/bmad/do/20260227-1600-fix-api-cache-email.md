# Fix — API Cache & Email — 20260227-1600

## Statut : ✅ Terminé — `npx tsc --noEmit` → 0 erreur

---

## Groupe C — API & Email

### `web/src/app/api/subscribers-count/route.ts`
- ✅ Ajout `export const revalidate = 3600;` → ISR Next.js met la réponse en cache 1h sur Vercel (Supabase n'est plus interrogé à chaque requête)

### `web/src/app/api/subscribe/route.ts`
- ✅ **Validation email renforcée** : regex `/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/` (TLD min 2 chars — `a@b.c` → 400)
- ✅ **Trim email/name** : `email.trim()` + `name.trim() || null` avec garde `typeof string` (pas de `any`)
- ✅ **Supabase insert** : utilise `trimmedEmail` et `trimmedName` (données nettoyées)
- ✅ **Resend `from`** : configurable via `process.env.RESEND_FROM_EMAIL` avec fallback `"Kore <contact@kore-app.com>"` (suppression du domaine dev `onboarding@resend.dev`)

## Logique inchangée
- Rate limiting, duplicate check (`23505`), welcome email : inchangés
- Types de retour API : inchangés (frontend non impacté)

---

## feat — Lien de désinscription dans l'email de bienvenue

### `web/src/emails/welcome.tsx`
- Ajout prop `email: string` (required)
- Import `createHmac` from `crypto`
- Token HMAC-SHA256(email, `RESEND_API_KEY`) généré à l'envoi
- `unsubscribeUrl` = `${NEXT_PUBLIC_SITE_URL}/api/unsubscribe?email=...&token=...`
- Footer : lien cliquable "Se désinscrire" (styled, couleur `textMuted`)

### `web/src/app/api/subscribe/route.ts`
- `email: trimmedEmail` passé à `WelcomeEmail()`

### `web/src/app/api/unsubscribe/route.ts` (nouveau)
- GET : vérifie token HMAC → supprime de Supabase → redirect success/error

### `web/src/app/unsubscribe/page.tsx` (nouveau)
- Page confirmation neumorphe (succès / erreur) + lien retour
