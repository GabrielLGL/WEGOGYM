<!-- v1.0 — 2026-02-22 -->
# Prompt — Supprimer Tab Bar & Page Programs — 20260222-2300

## Demande originale
Avec l'amelioration de l'UI, on peut enlever la barre de navigation du bas et creer une page speciale pour les programmes.

## Analyse
Le HomeScreen dashboard sert deja de hub central avec des tuiles de navigation vers toutes les sections (Programmes, Exercices, Stats, Assistant, Reglages). La tab bar est donc redondante et occupe de l'espace inutilement. ProgramsScreen existe deja en tant que fichier mais n'est pas enregistre dans la navigation.

## Groupes generes
| Groupe | Rapport | Fichiers | Vague | Statut |
|--------|---------|----------|-------|--------|
| A | `20260222-2300-remove-tabbar-A.md` | `navigation/index.tsx` | 1 | ⏳ |
| B | `20260222-2300-remove-tabbar-B.md` | `screens/HomeScreen.tsx` | 2 | ⏳ |
| C | `20260222-2300-remove-tabbar-C.md` | `hooks/useModalState.ts` + 7 ecrans + tests | 1 | ⏳ |

## Ordre d'execution

### Vague 1 — PARALLELE
- **Groupe A** : Restructure la navigation (supprime TabNavigator, ajoute tous les ecrans au Stack)
- **Groupe C** : Nettoie les hooks tab bar sync (useMultiModalSync, events HIDE/SHOW_TAB_BAR)

### Vague 2 — APRES Vague 1
- **Groupe B** : Met a jour HomeScreen (simplifie navigation, supprime MainTabParamList refs)
  - Depend de A (MainTabParamList supprime)

## Impact
- Tab bar supprimee → plus d'espace pour le contenu
- Navigation centralisee via le dashboard HomeScreen
- ProgramsScreen accessible via la tuile "Programmes" du dashboard
- Code simplifie : moins de types, moins d'events, moins de hooks
