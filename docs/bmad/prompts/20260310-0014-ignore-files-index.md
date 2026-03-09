<!-- v1.0 — 2026-03-10 -->
# Prompt — Complétion fichiers .ignore — 20260310-0014

## Demande originale
Vérifier tous les .ignore si ils sont tous bien complets

## Analyse
6 fichiers .ignore trouvés dans le projet (hors node_modules) :
- `.gitignore` (racine) — bon, petits ajustements
- `mobile/.gitignore` — bon, nettoyage mineur
- `mobile/.easignore` — incomplet, beaucoup de fichiers inutiles uploadés au build cloud
- `web/.gitignore` — ✅ complet (standard Next.js)
- `.claudeignore` — 🔴 malformé (wrapper PowerShell dans le contenu)
- `.vercelignore` — bon, petits ajustements

## Groupes générés
| Groupe | Rapport | Fichiers | Vague | Statut |
|--------|---------|----------|-------|--------|
| A | `docs/bmad/prompts/20260310-0014-ignore-files-A.md` | `.claudeignore`, `mobile/.easignore`, `mobile/.gitignore`, `.gitignore`, `.vercelignore` | 1 | ⏳ |

## Ordre d'exécution
Un seul groupe — tous les fichiers sont indépendants, corrections en une seule passe.
