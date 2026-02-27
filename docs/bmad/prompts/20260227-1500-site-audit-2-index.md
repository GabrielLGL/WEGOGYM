<!-- v1.0 — 2026-02-27 -->
# Prompt — Site Kore audit 2 (UI/UX + SEO) — 20260227-1500

## Demande originale
"Refait moi un rapport de mon site web, points à améliorer pour l'UI/UX, être bien référencé etc"

## Contexte
Audit réalisé après la session du 20260227-1430 qui a résolu :
- ✅ page.tsx → Server Component
- ✅ H1 en français avec keywords
- ✅ JSON-LD dans `<head>` + enrichi
- ✅ Tous les accents manquants (features.ts, pricing.ts, sections)
- ✅ Double formulaire → formulaire unique dans SubscribeSection
- ✅ Boutons pricing non fonctionnels → `<a href="#download">`
- ✅ SocialProof fallback trompeur supprimé
- ✅ `<main>` landmark ajouté
- ✅ Liens sociaux Instagram/TikTok dans footer
- ✅ Prix Pro Annuel clarifié (badge "soit 1,67€/mois")

## Points identifiés dans ce nouvel audit

### 🔴 CRITIQUE — SEO
| # | Problème | Groupe |
|---|---------|--------|
| 1 | `robots.txt` absent — Google crawle aveuglément | A |
| 2 | `sitemap.xml` absent — URLs non déclarées | A |
| 3 | Page 404 générique Next.js — sans branding | A |
| 4 | `/privacy` liée depuis footer+form mais page 404 | A |

### 🟠 IMPORTANT — Performance & Accessibilité
| # | Problème | Groupe |
|---|---------|--------|
| 5 | `.reveal` à `opacity: 0` → contenu invisible sans JS (signal SEO négatif) | B |
| 6 | Transition CSS thème active au 1er rendu → FOUC subtil sur certains navigateurs | B |
| 7 | `SocialProof` : fetch client à chaque visite → Supabase saturé + flash loading | B |

### 🟠 IMPORTANT — API
| # | Problème | Groupe |
|---|---------|--------|
| 8 | `/api/subscribers-count` : aucun cache → Supabase query à chaque requête | C |
| 9 | Email Resend envoyé depuis `onboarding@resend.dev` → risque spam en prod | C |
| 10 | Validation email trop permissive (accepte `a@b.c`, pas de trim) | C |

### 🟡 AMÉLIORATION — Non traité dans ces groupes (backlog)
| # | Problème | Impact |
|---|---------|--------|
| 11 | Pas d'image/screenshot de l'app dans le hero | Conversion -20-30% |
| 12 | Pas de section témoignages | Social proof faible |
| 13 | Pas d'Apple Touch Icon (180x180) ni manifest.json | PWA, iOS homescreen |
| 14 | Stats hero ("100%", "<1s") sans source | Crédibilité |
| 15 | `BackgroundBlobs` : deux `blur-[60px]` de 50vw → impact GPU | Perf mobile |

## Groupes générés
| Groupe | Rapport | Fichiers | Vague | Statut |
|--------|---------|----------|-------|--------|
| A — SEO fichiers manquants | `20260227-1500-site-audit-2-A.md` | `robots.ts`, `sitemap.ts`, `not-found.tsx`, `privacy/page.tsx` (nouveaux) | 1 | ⏳ |
| B — Perf & Accessibilité | `20260227-1500-site-audit-2-B.md` | `globals.css`, `layout.tsx`, `SocialProof.tsx`, `HeroSection.tsx`, `page.tsx` | 1 | ⏳ |
| C — API & Email | `20260227-1500-site-audit-2-C.md` | `api/subscribers-count/route.ts`, `api/subscribe/route.ts` | 1 | ⏳ |

## Ordre d'exécution
Les 3 groupes sont **indépendants** → lancer en parallèle (vague unique).

## Commandes de lancement
```
/do docs/bmad/prompts/20260227-1500-site-audit-2-A.md
/do docs/bmad/prompts/20260227-1500-site-audit-2-B.md
/do docs/bmad/prompts/20260227-1500-site-audit-2-C.md
```
