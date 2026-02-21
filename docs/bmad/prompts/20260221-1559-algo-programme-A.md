<!-- v1.0 — 2026-02-21 -->
# Rapport — Algo Programme — Groupe A : Nouvelles questions + Types — 20260221-1559

## Objectif
Ajouter 4 nouvelles questions dans le wizard de l'AssistantScreen et étendre l'interface `AIFormData`
pour capturer plus de contexte utilisateur : capacité de récupération, zones sensibles/blessures,
phase d'entraînement (prise de masse / sèche / maintien / recomposition), et tranche d'âge.

## Fichiers concernés
- `mobile/src/services/ai/types.ts`
- `mobile/src/screens/AssistantScreen.tsx`

## Contexte technique
- Le wizard est géré par la fonction `buildSteps()` dans `AssistantScreen.tsx`
- Chaque step a : `key`, `title`, `options`, `multi` (optionnel), `condition` (optionnel)
- L'état du formulaire est `AIFormData` défini dans `services/ai/types.ts`
- Les steps conditionnels s'affichent selon `form.mode` ('program' | 'session')
- Respecter le pattern visuel existant (emoji + label + description courte)
- Lang : français (fr-FR)
- Voir CLAUDE.md section 3 (contraintes strictes) et section 5 (standards de code)

## Nouvelles questions à ajouter (mode=program uniquement)

### Q1 — Phase d'entraînement
```
key: 'phase'
title: "Dans quelle phase es-tu ?"
options:
  - { value: 'prise_masse', label: 'Prise de masse 🍖', description: 'Surplus calorique, volume élevé' }
  - { value: 'seche', label: 'Sèche 🔥', description: 'Déficit, maintien musculaire' }
  - { value: 'recomposition', label: 'Recomposition ⚖️', description: 'Maintien calorique, transformation' }
  - { value: 'maintien', label: 'Maintien 🧘', description: 'Conserver les acquis' }
condition: form.mode === 'program'
```

### Q2 — Capacité de récupération
```
key: 'recovery'
title: "Comment te récupères-tu ?"
options:
  - { value: 'rapide', label: 'Rapide ⚡', description: 'Prêt dès le lendemain' }
  - { value: 'normale', label: 'Normale 😊', description: '48h entre groupes musculaires' }
  - { value: 'lente', label: 'Lente 🐢', description: 'Besoin de 72h+' }
condition: form.mode === 'program'
```

### Q3 — Zones sensibles / blessures
```
key: 'injuries'
title: "As-tu des zones sensibles ?"
multi: true
options:
  - { value: 'none', label: 'Aucune ✅' }
  - { value: 'epaules', label: 'Épaules 🦴' }
  - { value: 'genoux', label: 'Genoux 🦵' }
  - { value: 'bas_dos', label: 'Bas du dos 🔻' }
  - { value: 'poignets', label: 'Poignets ✋' }
  - { value: 'nuque', label: 'Nuque/Cou 🤕' }
condition: form.mode === 'program'
```

### Q4 — Tranche d'âge
```
key: 'ageGroup'
title: "Dans quelle tranche d'âge es-tu ?"
options:
  - { value: '18-25', label: '18–25 ans 🚀' }
  - { value: '26-35', label: '26–35 ans 💪' }
  - { value: '36-45', label: '36–45 ans 🧠' }
  - { value: '45+', label: '45+ ans 🎖️' }
condition: form.mode === 'program'
```

## Modifications types.ts

Étendre l'interface `AIFormData` avec :
```typescript
phase?: 'prise_masse' | 'seche' | 'recomposition' | 'maintien'
recovery?: 'rapide' | 'normale' | 'lente'
injuries?: string[] // 'none' | 'epaules' | 'genoux' | 'bas_dos' | 'poignets' | 'nuque'
ageGroup?: '18-25' | '26-35' | '36-45' | '45+'
```

## Ordre d'insertion dans le wizard

Insérer après l'étape `split` (sélection du style de programme), avant `daysPerWeek` :
1. `phase` (nouveau)
2. `recovery` (nouveau)
3. `injuries` (nouveau, multi)
4. `ageGroup` (nouveau)

## Contraintes
- Ne pas casser les steps existants ni la validation des deps split/days
- Conserver tous les champs optionnels (? en TypeScript)
- Respecter le pattern Step existant dans buildSteps()
- `injuries: ['none']` doit désactiver tous les autres (logique XOR dans le multi-select)
- No `any` TypeScript
- Aucun hardcoded color
- Lang : french dans les labels utilisateur

## Critères de validation
- `npx tsc --noEmit` → zéro erreur
- `npm test` → zéro fail
- Le wizard affiche bien les 4 nouvelles questions en mode 'program'
- Les valeurs sont transmises dans `form` au moment de `generatePlan(form, user)`
- La sélection 'Aucune' dans injuries désélectionne les autres options

## Dépendances
Aucune dépendance amont. Le Groupe C (algorithme) dépend de ce groupe.

## Statut
⏳ En attente
