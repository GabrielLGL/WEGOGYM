<!-- v1.0 — 2026-02-26 -->
# Prompt — Vrai neumorphisme react-native-shadow-2 — 20260226-2100

## Demande originale
Implémenter le vrai neumorphisme (double-ombre SVG) via react-native-shadow-2 sur les
composants clés : Button et SettingsScreen.

## Groupes générés
| Groupe | Rapport | Fichiers | Vague | Statut |
|--------|---------|----------|-------|--------|
| A | `20260226-2100-neu-shadow-2-A.md` | package.json, NeuShadow.tsx, theme/index.ts | 1 | ✅ |
| B | `20260226-2100-neu-shadow-2-B.md` | Button.tsx, SettingsScreen.tsx | 2 | ✅ |

## Ordre d'exécution
- **Vague 1** : Groupe A seul (install + composant + tokens)
- **Vague 2** : Groupe B après A (migration composants — dépend de NeuShadow)

## Résultat implémenté
- `react-native-shadow-2@7.1.2` installé
- `NeuShadow.tsx` créé : 2 Shadow SVG imbriqués (dark offset[+d,+d] / light offset[-d,-d])
- `neuShadowParams` ajouté dans theme (dark + light, 3 niveaux)
- `lightColors.background = lightColors.card = '#e8ecef'`
- `Button.tsx` : NeuShadow wrapper + isPressed state
- `SettingsScreen.tsx` : 8 sections wrappées avec NeuShadow
- TypeScript : 0 erreur
- Tests : 1255/1259 (4 échecs préexistants non liés)
