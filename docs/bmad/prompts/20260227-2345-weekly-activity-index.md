<!-- v1.0 — 2026-02-27 -->
# Prompt — Weekly Activity HomeScreen — 20260227-2345

## Demande originale
"j'aimerais que la partie activité dans le homescreen au lieu de voir les seances dans les derniers mois j'aimerais que ça soit juste pour la semaine avec un mini recap des seances propose pour chaque jours, propose aussi des amelioration"

## Groupes générés
| Groupe | Rapport | Fichiers | Vague | Statut |
|--------|---------|----------|-------|--------|
| A | `20260227-2345-weekly-activity-A.md` | statsTypes.ts, statsVolume.ts | 1 | ⏳ |
| B | `20260227-2345-weekly-activity-B.md` | HomeScreen.tsx, HomeScreen.test.tsx | 2 | ⏳ |

## Ordre d'exécution
1. **Vague 1** — Groupe A : pose les fondations (types + fonction utilitaire)
2. **Vague 2** — Groupe B : UI HomeScreen (dépend des exports du Groupe A)

## Améliorations incluses
- Aujourd'hui mis en avant (border primary)
- Volume hebdomadaire + count séances dans le sous-titre
- Durée de séance (si endTime disponible)
- Count de séries par séance
- Empty state contextuel : "Repos" (passé sans séance) vs "—" (futur)
