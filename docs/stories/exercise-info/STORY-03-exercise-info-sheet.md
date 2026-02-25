# STORY-03 — Composant ExerciseInfoSheet

## Description
Creer un composant BottomSheet affichant les informations completes d'un exercice : placeholder animation, nom, muscles cibles, description, notes personnelles.

## Taches techniques
1. Creer `mobile/src/components/ExerciseInfoSheet.tsx`
2. Props : `exercise: Exercise`, `visible: boolean`, `onClose: () => void`
3. Utiliser le `<BottomSheet>` existant (Portal pattern)
4. Layout :
   - Zone placeholder (icone barbell-outline 48px + texte "Animation a venir")
   - Nom exercice (bold, 20px)
   - Chips muscles (flexWrap, bg primaryBg, text primary)
   - Section Description (label + texte ou "Pas de description disponible")
   - Section Notes (label + texte italic ou "Aucune note")
5. Theme dark mode, couleurs du theme uniquement
6. Creer `mobile/src/components/__tests__/ExerciseInfoSheet.test.tsx`
7. Lancer `npx tsc --noEmit` → 0 erreur

## Criteres d'acceptation
- [ ] Composant rend correctement avec un exercice complet (description + notes)
- [ ] Composant gere l'absence de description
- [ ] Composant gere l'absence de notes
- [ ] Utilise BottomSheet existant (Portal, pas de Modal natif)
- [ ] Se ferme au tap overlay et au back Android
- [ ] Aucune couleur hardcodee
- [ ] TypeScript compile sans erreur
- [ ] Test unitaire passe

## Estimation
M (1-2h)

## Dependances
STORY-01 (model Exercise avec description/animationKey)
