# S07 — Insertion DB depuis le plan généré
> Priorité : Must | Dépend de : S01, S06 | Bloque : S08

## Objectif
Sauvegarder le `GeneratedPlan` validé en base WatermelonDB.

## Tâches techniques
Ajouter dans `model/utils/databaseHelpers.ts` une fonction `importGeneratedPlan()` :

### Mode Programme
Réutilise le pattern exact de `importPresetProgram()` :
```ts
export async function importGeneratedPlan(plan: GeneratedPlan): Promise<Program>
// Crée Program + Sessions + SessionExercises dans un database.batch()
// Exercice introuvable par nom → tente un match case-insensitive → sinon crée un Exercise custom
// Retourne le Program créé pour la redirection
```

### Mode Séance
```ts
export async function importGeneratedSession(
  session: GeneratedSession,
  programId: string
): Promise<Session>
// Crée Session + SessionExercises rattachés au programId fourni
// Retourne la Session créée pour la redirection vers SessionDetail
```

### Correspondance exercices
1. Cherche par nom exact dans la DB
2. Cherche par nom case-insensitive
3. Si toujours introuvable → crée un exercice custom `is_custom: true`

## Critères d'acceptation
- [ ] Mode programme : `Program` + `Session`s + `SessionExercise`s créés en une transaction atomique
- [ ] Mode séance : `Session` + `SessionExercise`s rattachés au bon `program_id`
- [ ] Exercices inconnus créés automatiquement comme custom
- [ ] Redirection vers Home (programme) ou SessionDetail (séance) après validation
- [ ] Réactif WatermelonDB : Home se met à jour automatiquement sans refresh manuel
