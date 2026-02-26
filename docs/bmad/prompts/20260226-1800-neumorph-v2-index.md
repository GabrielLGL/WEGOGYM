<!-- v1.0 — 2026-02-26 -->
# Prompt — Neumorphisme v2 — 20260226-1800

## Demande originale
"pour l'UI le neumorphisme — I would like to be like on the website, that there are really dark and white or black. That it is a bit of a degraded, like on the web page that we did before."

## Problème identifié
Le neumorphisme actuel a des ombres trop peu contrastées :
- `neuShadowDark: '#16181d'` vs background `'#21242b'` → différence de seulement ~3 niveaux
- `neuShadowLight: '#2c3039'` → à peine plus clair que le fond
- Résultat : relief quasi invisible, surtout sur Android

## Solution
- **Groupe A** : Intensifier les tokens dans `theme/index.ts` — ombres near-black (`#060809`), reflets bien visibles (`#3c4558`), + tokens gradient
- **Groupe B** : Appliquer LinearGradient sur Button primary et HomeScreen background

## Groupes générés

| Groupe | Rapport | Fichiers | Vague | Statut |
|--------|---------|----------|-------|--------|
| A | `docs/bmad/prompts/20260226-1800-neumorph-v2-A.md` | `theme/index.ts` | 1 | ⏳ |
| B | `docs/bmad/prompts/20260226-1800-neumorph-v2-B.md` | `Button.tsx`, `HomeScreen.tsx` | 2 | ⏳ |

## Ordre d'exécution
1. **Vague 1 — Groupe A** : Mettre à jour les tokens theme (indépendant)
2. **Vague 2 — Groupe B** : Utiliser les nouveaux tokens gradient dans les composants (dépend de A)

## Changements visuels attendus
- Dark mode : ombres near-black + reflets clairs = relief très prononcé, effet 3D tactile
- Light mode : ombres `#8a9bb0` + reflets blancs purs = effet clay/plastique
- Button primary : dégradé cyan `#00d9d4 → #007a77`
- Fond HomeScreen : dégradé subtil `#22262e → #181b21`
