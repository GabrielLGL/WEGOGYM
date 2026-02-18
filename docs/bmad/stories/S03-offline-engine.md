# S03 — Moteur de règles offline
> Priorité : Must | Dépend de : S02 | Bloque : S06

## Objectif
Implémenter le moteur de génération offline basé sur des règles métier sportives.

## Tâches techniques
Créer `mobile/src/services/ai/offlineEngine.ts` :

### Règles de génération programme
- Calcul du nombre d'exercices par séance selon `durationMin` :
  - 30 min → 4 exercices, 45 min → 5, 60 min → 6, 90 min → 8
- Répartition musculaire selon `daysPerWeek` :
  - 2-3 jours → Full Body
  - 4 jours → Upper/Lower
  - 5-6 jours → Push/Pull/Legs
- Séries × reps selon `goal` :
  - masse → 4×8, force → 5×5, perte → 3×12, cardio → 3×15
- Sélection des exercices depuis `context.exercises` filtrés par équipement disponible
- Pas de répétition du même groupe musculaire deux jours consécutifs

### Règles de génération séance
- Filtrer les exercices par `muscleGroup` + `equipment`
- Appliquer les séries/reps selon `goal`
- Nommer la séance : "{muscleGroup} – {level}"

### Export
```ts
export const offlineEngine: AIProvider = {
  async generate(form: AIFormData, context: DBContext): Promise<GeneratedPlan> { ... }
}
```

## Critères d'acceptation
- [ ] Mode programme : génère N séances cohérentes (N = daysPerWeek)
- [ ] Mode séance : génère une séance unique correctement nommée
- [ ] Séries/reps conformes à l'objectif
- [ ] Fonctionne sans connexion réseau
- [ ] N'utilise que les exercices présents dans `context.exercises`
