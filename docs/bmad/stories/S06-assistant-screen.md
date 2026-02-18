# S06 — Écran Assistant (formulaire + aperçu)
> Priorité : Must | Dépend de : S03, S05 | Bloque : S07

## Objectif
Créer l'écran principal de l'Assistant avec les deux formulaires et le bottom sheet d'aperçu.

## Tâches techniques

### `screens/AssistantScreen.tsx`
- Sélecteur de mode : "Programme" / "Séance" (deux cards cliquables)
- Affichage conditionnel du formulaire selon le mode
- Bouton "Générer" → appelle `aiService.generatePlan()` → affiche loading → ouvre `AssistantPreviewSheet`
- Formulaire Programme : objectif (ChipSelector), niveau (radio), équipement (checkboxes), jours/semaine (chips 3-6), durée (radio)
- Formulaire Séance : groupe musculaire (ChipSelector), niveau (radio), équipement (checkboxes), durée (radio), sélecteur de programme cible (`withObservables` sur `programs`)
- Indicateur provider actif en bas de l'écran (ex: "⚡ Mode Offline")

### `components/AssistantPreviewSheet.tsx`
- Utilise `<BottomSheet>` + Portal (pattern existant)
- Champ nom éditable en haut
- ScrollView des séances avec exercices et séries×reps
- Boutons "Modifier" (ferme sheet, retourne au formulaire pré-rempli) et "Valider" (appelle S07)
- `useHaptics().onSuccess()` à la validation

### Hooks utilisés
- `useModalState()` pour le BottomSheet
- `useHaptics()` pour les interactions
- `withObservables` pour la liste des programmes (sélecteur séance)

## Critères d'acceptation
- [ ] Formulaire Programme visible en mode "Programme"
- [ ] Formulaire Séance visible en mode "Séance" avec sélecteur de programme
- [ ] Loading pendant la génération
- [ ] Aperçu correct : nom éditable + liste séances/exercices avec séries×reps
- [ ] Bouton "Modifier" retourne au formulaire pré-rempli
- [ ] Pas de crash lié aux modals (Portal obligatoire)
- [ ] Textes en français
