# Passe 3/8 — Code Review

## Issues trouvées

### [CRITICAL] #1 — `handleAdd` ne clamp pas `targetReps`
- **Fichier:** `mobile/src/components/ExercisePickerModal.tsx:111-114`
- **Problème:** `handleAdd` clamp `targetSets` (1-10) et `targetWeight` (0-999), mais `targetReps` est passé directement sans clamping ni parsing. Un utilisateur peut entrer des nombres arbitrairement grands ou négatifs.
- **Fix suggéré:** Appliquer le même pattern de clamping : `const clampedReps = targetReps !== '' ? String(Math.min(Math.max(parseIntegerInput(targetReps), 1), 100)) : ''`

### [WARNING] #2 — Default param français hardcodé `othersLabel = 'Autres'`
- **Fichier:** `mobile/src/model/utils/statsMuscle.ts:42`
- **Problème:** Le paramètre `othersLabel` a une valeur par défaut hardcodée en français. Tout call site qui omet ce paramètre affichera du texte non traduit en mode anglais.
- **Fix suggéré:** Rendre le paramètre obligatoire pour forcer l'usage i18n.

### [WARNING] #3 — Default param français hardcodé `sessionFallback = 'Séance'`
- **Fichier:** `mobile/src/model/utils/statsVolume.ts:141`
- **Problème:** Même pattern que #2 — fallback français hardcodé.
- **Fix suggéré:** Rendre le paramètre obligatoire.

### [WARNING] #4 — `equipmentMap` avec clés françaises hardcodées
- **Fichier:** `mobile/src/services/ai/aiService.ts:49-55`
- **Problème:** L'objet `equipmentMap` contient des strings françaises hardcodées. Si l'app est en anglais, les valeurs `form.equipment` ne matcheront pas ces clés, causant un filtre silencieusement défaillant.
- **Fix suggéré:** Utiliser des clés canoniques internes (pas des strings d'affichage).

### [WARNING] #5 — `ErrorBoundary` utilise uniquement les couleurs dark theme
- **Fichier:** `mobile/src/components/ErrorBoundary.tsx:5,90-142`
- **Problème:** Import statique de `colors` (dark theme). En light mode, le rendu sera visuellement incohérent. Commenté comme "intentional exception".
- **Fix suggéré:** Extraire le rendu dans un composant fonctionnel `ErrorFallback` qui utilise `useColors()`.

### [WARNING] #6 — Prop `unlockedAt` inutilisée dans `BadgeCard`
- **Fichier:** `mobile/src/components/BadgeCard.tsx:13,16`
- **Problème:** L'interface `BadgeCardProps` déclare `unlockedAt?: Date` mais le composant ne la destructure pas.
- **Fix suggéré:** Retirer la prop de l'interface et arrêter de la passer depuis `BadgesScreen`.

### [WARNING] #7 — Month labels anglais par défaut dans `computeMonthlySetsChart`
- **Fichier:** `mobile/src/model/utils/statsMuscle.ts:195`
- **Problème:** `MONTH_LABELS_DEFAULT` utilise des abréviations anglaises. Si un appelant oublie `monthLabels`, les charts affichent des mois anglais.
- **Fix suggéré:** Rendre `monthLabels` obligatoire.

### [SUGGESTION] #8 — `renderExerciseItem` useCallback inefficace
- **Fichier:** `mobile/src/components/ExercisePickerModal.tsx:125-139`
- **Problème:** Le callback inclut `haptics` dans ses dépendances. Si `useHaptics()` retourne un nouvel objet à chaque render, le `useCallback` est recréé inutilement.
- **Fix suggéré:** Vérifier que `useHaptics()` memoize son retour, ou utiliser une ref.

### [SUGGESTION] #9 — Pas de garde contre double-tap sur `completeWorkout`
- **Fichier:** `mobile/src/hooks/useWorkoutCompletion.ts:83-84,246`
- **Problème:** `completeWorkout` peut être appelé plusieurs fois concurremment (double-tap bouton finish). Pas de garde `isRunningRef`.
- **Fix suggéré:** Ajouter `if (isRunningRef.current) return null; isRunningRef.current = true; try { ... } finally { isRunningRef.current = false; }`

### [WARNING] #10 — Model Claude pinné sur snapshot daté
- **Fichier:** `mobile/src/services/ai/claudeProvider.ts:5`
- **Problème:** `claude-haiku-4-5-20251001` est un snapshot daté. Risque de deprecation comme pour les modèles Gemini.
- **Fix suggéré:** Utiliser `claude-haiku-4-5` (alias stable).

## Résumé
- 🔴 **1 CRITICAL** (#1)
- 🟡 **7 WARNING** (#2-7, #10)
- 🔵 **2 SUGGESTION** (#8-9)
