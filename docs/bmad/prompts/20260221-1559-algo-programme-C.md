<!-- v1.0 — 2026-02-21 -->
# Rapport — Algo Programme — Groupe C : Moteur algorithmique avancé — 20260221-1559

## Objectif
Mettre à jour `offlineEngine.ts` pour exploiter les nouvelles données (Groupes A + B) :
filtrage par blessures, ajustement de volume selon récupération et âge, équilibrage
stretchFocus/contraction, prise en compte de la phase (prise masse/sèche), et
recommandations de RPE et temps de repos adaptatives.

## Fichiers concernés
- `mobile/src/services/ai/offlineEngine.ts`

## Contexte technique
- L'entrée principale est `AIFormData` (étendue par Groupe A)
- Les métadonnées exercice sont dans `ExerciseMetadata` (enrichies par Groupe B)
- La fonction principale est `generateProgram(form, context)` → retourne `GeneratedPlan`
- `buildSession(name, muscles, form, context, usedNames)` construit chaque séance
- `selectExercises(candidates, count, usedNames, recentMuscles)` choisit les exercices
- Context : `{ exercises[], recentMuscles[], prs }` — données live de la DB
- Voir CLAUDE.md section 3.1 (Known Pitfalls) — No any, No console.log production

## Améliorations à implémenter

### A. Filtrage par zones sensibles (injuries)

Dans `selectExercises()` ou `buildSession()`, après récupération des candidats :
```typescript
// Exclure exercices dont injuryRisk contient une zone de form.injuries
if (form.injuries && !form.injuries.includes('none')) {
  candidates = candidates.filter(ex => {
    const meta = EXERCISE_METADATA[ex.name]
    if (!meta) return true
    return !meta.injuryRisk.some(zone => form.injuries!.includes(zone))
  })
}
```

### B. Ajustement volume selon recovery + ageGroup

Créer une fonction `getVolumeMultiplier(form)` :
```typescript
function getVolumeMultiplier(form: AIFormData): number {
  let multiplier = 1.0

  // Recovery
  if (form.recovery === 'rapide') multiplier += 0.15
  if (form.recovery === 'lente') multiplier -= 0.15

  // Age group
  if (form.ageGroup === '36-45') multiplier -= 0.10
  if (form.ageGroup === '45+') multiplier -= 0.20
  if (form.ageGroup === '18-25') multiplier += 0.05

  return Math.max(0.6, Math.min(1.4, multiplier)) // clamp [0.6, 1.4]
}
```

Appliquer dans `SETS_BY_TYPE_GOAL` : `sets = Math.round(baseSets * volumeMultiplier)`
Clamp les sets : compound_heavy max 6, isolation max 4.

### C. Ajustement par phase

Créer une fonction `getPhaseAdjustment(phase, baseReps)` qui retourne { reps, intensity } :
```typescript
// prise_masse : +1 set sur composés, reps légèrement plus élevées
// seche : même volume, reps plus élevées (+2-4), poids légèrement réduit
// recomposition : reps modérées, RPE plus élevé
// maintien : volume réduit de 20%, maintien intensité
```

Modifier `REPS_BY_TYPE_GOAL` pour prendre en compte `form.phase`.

### D. Équilibre stretchFocus dans chaque séance

Dans `buildSession()`, après la sélection initiale des exercices, vérifier la répartition :
- Minimum 30% des exercices par muscle doivent avoir `stretchFocus: true` (pour hypertrophie)
- Si insuffisant, remplacer l'exercice de plus faible SFR par un alternatif stretchFocus

```typescript
function ensureStretchBalance(exercises: SelectedExercise[], candidates: Exercise[]): SelectedExercise[] {
  const stretchCount = exercises.filter(e => EXERCISE_METADATA[e.name]?.stretchFocus).length
  const target = Math.ceil(exercises.length * 0.3)

  if (stretchCount < target) {
    // Trouver les candidats stretchFocus non utilisés
    // Remplacer l'exercice à plus faible SFR par un stretchFocus disponible
  }

  return exercises
}
```

### E. Recommandations repos et RPE

Ajouter dans `GeneratedExercise` (dans types.ts si nécessaire) :
```typescript
restSeconds?: number  // Temps de repos recommandé
rpe?: number          // RPE cible (6-10)
```

Calculer selon goal + type :
```typescript
function getRestAndRPE(type: ExerciseType, goal: Goal, phase?: Phase): { restSeconds: number, rpe: number } {
  // power + compound_heavy → 180-240s repos, RPE 8-9
  // bodybuilding + compound → 90-120s repos, RPE 7-8
  // bodybuilding + isolation → 60-90s repos, RPE 8-9
  // cardio → 30-45s repos, RPE 6-7
  // seche → réduire repos de 20%
  // prise_masse → augmenter repos de 15%
}
```

### F. Semaine de décharge (deload) intégrée

Si `form.daysPerWeek >= 4` et `form.recovery !== 'rapide'` et `form.ageGroup` est '36-45' ou '45+' :
Ajouter un flag `includeDeload: true` dans le plan généré, et dans le nom du programme
ajouter "(avec décharge)" pour informer l'utilisateur.

Note : Ne pas générer les séances de décharge maintenant — juste le flag et l'info dans le nom.

## Structure des modifications dans offlineEngine.ts

1. Ajouter `getVolumeMultiplier(form)` → utilisé dans sets calculation
2. Ajouter `getPhaseAdjustment(phase, type, goal)` → ajuste reps
3. Modifier `selectExercises()` → filtrage injuries
4. Ajouter `ensureStretchBalance()` → appelé après buildSession
5. Modifier `getRestAndRPE()` → calcul repos/RPE
6. Modifier `generateProgram()` → flag deload

## Contraintes
- Ne PAS casser la génération existante si les nouveaux champs sont absents (form.injuries undefined, etc.)
- Tous les nouveaux champs de `AIFormData` sont OPTIONNELS → toujours utiliser `form.recovery ?? 'normale'`
- No `console.log` sans guard `__DEV__`
- No `any` TypeScript
- WatermelonDB mutations → toujours dans `database.write()` (déjà respecté dans databaseHelpers)
- Respecter la valeur minimale de sets : compound_heavy ≥ 3, isolation ≥ 2

## Critères de validation
- `npx tsc --noEmit` → zéro erreur
- `npm test` → zéro fail
- Cas test : form avec `injuries: ['bas_dos']` → aucun DL, Squat, Good Morning dans le plan
- Cas test : form avec `recovery: 'lente'`, `ageGroup: '45+'` → volume réduit (sets ≤ baseline)
- Cas test : form avec `phase: 'seche'` → reps plus élevées que baseline

## Dépendances
Dépend de :
- **Groupe A** (types AIFormData étendus avec phase, recovery, injuries, ageGroup)
- **Groupe B** (ExerciseMetadata enrichi avec sfr, stretchFocus, injuryRisk)

Exécuter APRÈS que les Groupes A et B soient terminés.

## Statut
⏳ En attente
