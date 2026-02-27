<!-- v1.0 — 20260227-0000 -->
# Prompt — aria-busy button — 20260227-0000

## Demande originale
Dans web/src/app/page.tsx, sur le bouton de soumission du formulaire, remplace l'attribut
disabled={status === 'loading'} par une combinaison aria-busy={status === 'loading'} +
aria-disabled={status === 'loading'} + tabIndex géré manuellement. Assure-toi que le test
existant dans page.test.tsx qui vérifie 'Inscription...' continue de passer.

## Groupes générés
| Groupe | Rapport | Fichiers | Vague | Statut |
|--------|---------|----------|-------|--------|
| A | `docs/bmad/prompts/20260227-0000-aria-busy-button-A.md` | `web/src/app/page.tsx` | 1 | ⏳ |

## Ordre d'exécution
1 seul groupe, pas de dépendances.
