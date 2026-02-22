<!-- v1.0 — 2026-02-21 -->
# Prompt — back-button-bottomsheet — 20260221-1800

## Demande originale
"je veux que quand on a la bottom sheet du programme genere, quand on fais retour, il ferme la bottomsheet comme quand on appuie ailleur"

## Analyse
- **Quoi** : BackHandler Android non géré dans `BottomSheet.tsx` → le bouton retour ne ferme pas le sheet
- **Fix** : Ajouter `BackHandler.addEventListener('hardwareBackPress', ...)` quand `visible=true`, cleanup quand `visible=false`
- **Impact** : Tous les bottom sheets du projet en bénéficient (AlertDialog inclus)

## Groupes générés
| Groupe | Rapport | Fichiers | Vague | Statut |
|--------|---------|----------|-------|--------|
| A | 20260221-1800-back-button-bottomsheet-A.md | BottomSheet.tsx | 1 | ✅ |

## Ordre d'exécution
Un seul groupe, pas de dépendances.

## Statut
✅ Résolu — 20260222-1000

## Résolution
Rapport do : docs/bmad/do/20260221-1800-fix-back-button-bottomsheet.md
Fix appliqué : commit ea84e8a — BackHandler déjà en place dans BottomSheet.tsx
