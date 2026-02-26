# STYLE(button) — Revert NeuShadow → neuShadow spread natif
Date : 2026-02-26 21:45

## Instruction
docs/bmad/prompts/20260226-2145-revert-neushadow-A.md

## Rapport source
docs/bmad/prompts/20260226-2145-revert-neushadow-A.md (description directe)

## Classification
Type : style
Fichiers modifiés :
- `mobile/src/components/Button.tsx` (modifié)
- `mobile/src/components/NeuShadow.tsx` (supprimé)

## Ce qui a été fait
- Supprimé `import { useState }` et `import { NeuShadow }` de Button.tsx
- Ajouté `neuShadow` dans la déstructuration de `useTheme()`
- Supprimé `const [isPressed, setIsPressed] = useState(false)`
- Supprimé la variable `pressable`, les handlers `onPressIn`/`onPressOut`, le guard `if (variant === 'ghost')` et le return `<NeuShadow>...</NeuShadow>`
- Remplacé par un `<Pressable>` direct dont `style` est une fonction `({ pressed }) =>` intégrant `neuShadow.pressed / neuShadow.elevated` selon l'état appuyé
- `LinearGradient` sur le bouton primary conservé intact
- Prop `style` du consommateur appliquée directement sur le `<Pressable>` (layout externe)
- Supprimé `mobile/src/components/NeuShadow.tsx`

## Vérification
- TypeScript : ✅ zéro erreur
- Tests : ✅ 1259 passed (75 suites)
- Nouveau test créé : non (comportement déjà couvert)

## Documentation mise à jour
aucune

## Statut
✅ Résolu — 20260226-2145

## Commit
95db8b5 style(button): revert NeuShadow wrapper → neuShadow spread natif
