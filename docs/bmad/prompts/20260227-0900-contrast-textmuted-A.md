<!-- v1.0 — 2026-02-27 -->
# Rapport — contrast-textmuted — Groupe A — 20260227-0900

## Objectif
Corriger le contraste des couleurs de texte secondaire ("muted") dans le thème
pour passer WCAG AA (≥ 4.5:1 sur texte normal, ≥ 3:1 sur grand texte).

## Fichiers concernés
- `mobile/src/theme/index.ts` — seul fichier à modifier

## Contexte technique
- Pas de `textMuted` dans le theme — l'équivalent est `textSecondary` + `placeholder`
- `useColors()` hook dans `ThemeContext.tsx` expose ces couleurs à tous les composants
- **Ne PAS modifier** les noms des clés (textSecondary, placeholder) — 128+ références
- **Ne PAS modifier** les valeurs dark mode si le ratio est déjà ≥ 4.5:1

## Ratios actuels (calculés WCAG)

| Couleur | Mode | Valeur | Fond | Ratio | Action |
|---------|------|--------|------|-------|--------|
| textSecondary | Dark | #b2bec3 | #181b21 | ~9.85:1 | Laisser tel quel |
| textSecondary | Light | #636e72 | #d8dde6 | ~3.62:1 | ❌ Assombrir |
| placeholder | Dark | #636e72 | #181b21 | ~3.71:1 | ⚠️ Légèrement assombrir |
| placeholder | Light | #8a9299 | #d8dde6 | ~2.22:1 | ❌ Assombrir fortement |

## Étapes
1. Ouvrir `mobile/src/theme/index.ts`
2. Dans `lightColors` :
   - `textSecondary` : changer `#636e72` → valeur cible ≥ 4.5:1 sur `#d8dde6` (ex: `#4a5568` ou similaire)
   - `placeholder` : changer `#8a9299` → valeur cible ≥ 3:1 sur `#d8dde6` (texte placeholder = large type) (ex: `#636e72` ou similaire)
3. Dans `colors` (dark mode) :
   - `placeholder` : changer `#636e72` → valeur cible ≥ 4.5:1 sur `#181b21` (ex: `#8a9299` ou similaire)
   - Vérifier le ratio obtenu avec un outil WCAG
4. Conserver la hiérarchie visuelle : `text` > `textSecondary` > `placeholder`

## Contraintes
- Ne pas casser : noms des clés, structure de l'objet
- Respecter : dark mode + light mode neumorphique, palette existante
- Jamais hardcoder des couleurs dans des composants — tout passe par theme/index.ts
- Garder `textSecondary` dark (~9.85:1) inchangé

## Critères de validation
- Ratios WCAG AA après fix :
  - textSecondary light ≥ 4.5:1 sur #d8dde6
  - placeholder dark ≥ 4.5:1 sur #181b21 (ou ≥ 3:1 si considéré grand texte)
  - placeholder light ≥ 3:1 sur #d8dde6
- `npx tsc --noEmit` → zéro erreur (changements de valeurs string, pas de types)
- `npm test` → zéro fail
- Vérification visuelle : l'app reste lisible et la hiérarchie texte est préservée

## Dépendances
Aucune dépendance inter-groupes.

## Statut
✅ Résolu — 20260227-0900

## Résolution
Rapport do : docs/bmad/do/20260227-0900-style-contrast-textmuted.md
