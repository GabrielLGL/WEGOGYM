<!-- v1.0 — 2026-03-11 -->
# Prompt — Badge detail au clic — 20260311-2215

## Demande originale
quand on clique sur les badge je veux qu'on puisse voir comment les obtenir

## Groupes générés

| Groupe | Rapport | Fichiers | Vague | Statut |
|--------|---------|----------|-------|--------|
| A — Tout | `20260311-2215-badge-detail-A.md` | BadgeCard.tsx, BadgesScreen.tsx, fr.ts, en.ts | 1 | ⏳ |

## Ordre d'exécution
Un seul groupe — toutes les modifications sont couplées.

## Résumé technique
- Clic sur badge (verrouillé ou non) → BottomSheet de détail
- Affiche : icône, titre, description, condition d'obtention, statut (obtenu/non)
- Long press sur badge déverrouillé → ShareBottomSheet (inchangé)
- Condition générée depuis `category` + `threshold` de `BadgeDefinition`
- Nouvelles clés i18n : `t.badges.conditions.*` avec templates `{n}`
