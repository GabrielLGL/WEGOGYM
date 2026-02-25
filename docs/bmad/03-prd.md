# PRD — Animations/Demos exercices — 2026-02-25

## Vue d'ensemble
Systeme de fiches d'exercice avec placeholder visuel, description textuelle et acces rapide pendant la seance. Structure prete pour recevoir des animations reelles dans une phase ulterieure.

Feature : #99 (Videos/animations execution)

---

## User Stories & Criteres d'acceptation

### US-01 — Migration schema : animation_key et description sur Exercise [MUST]
**En tant que** developpeur,
**je veux** ajouter les colonnes `animation_key` (string, optional) et `description` (string, optional) sur la table `exercises`,
**afin de** stocker les references d'animation et les descriptions texte pour chaque exercice.

**Criteres d'acceptation :**
- [ ] Schema v21 avec `animation_key` et `description` sur `exercises`
- [ ] Migration `addColumns` non-destructive dans `migrations.ts`
- [ ] Model Exercise mis a jour avec les decorateurs `@text` correspondants
- [ ] Sync parfait schema <-> model (Known Pitfall)
- [ ] `npx tsc --noEmit` → 0 erreur
- [ ] Tests existants passent

---

### US-02 — Descriptions texte et animation_key pour 20-30 exercices de base [MUST]
**En tant que** debutant,
**je veux** voir des instructions d'execution courtes pour chaque exercice courant,
**afin de** savoir comment faire le mouvement correctement.

**Criteres d'acceptation :**
- [ ] Fichier `exerciseDescriptions.ts` dans `model/utils/`
- [ ] Mapping : exerciseName → { animationKey, description }
- [ ] 20-30 exercices de base couverts
- [ ] Descriptions en francais, 2-4 phrases, cues actionables sans jargon
- [ ] Chaque description inclut : position de depart, mouvement, respiration ou cue cle
- [ ] Script/helper de seed pour mettre a jour les exercices existants en base
- [ ] `npx tsc --noEmit` → 0 erreur

---

### US-03 — Composant ExerciseInfoSheet [MUST]
**En tant que** utilisateur,
**je veux** voir une fiche d'information complete sur un exercice dans un BottomSheet,
**afin de** consulter la description, les muscles cibles et mes notes rapidement.

**Criteres d'acceptation :**
- [ ] Nouveau composant `ExerciseInfoSheet.tsx` dans `components/`
- [ ] Utilise `<BottomSheet>` existant (Portal pattern — pas de Modal natif)
- [ ] Affiche dans l'ordre :
  - Zone placeholder visuel (icone stylisee + texte "Animation a venir")
  - Nom de l'exercice
  - Chips des muscles cibles
  - Description textuelle (ou "Pas de description disponible")
  - Notes personnelles (ou invite a ajouter des notes)
- [ ] Props : `exercise: Exercise`, `visible: boolean`, `onClose: () => void`
- [ ] Se ferme proprement (tap dehors ou bouton)
- [ ] Theme dark mode respecte (couleurs du theme uniquement)
- [ ] `npx tsc --noEmit` → 0 erreur
- [ ] Test unitaire du composant

---

### US-04 — Bouton info dans SessionExerciseItem [MUST]
**En tant que** utilisateur en pleine seance,
**je veux** un bouton discret a cote du nom de l'exercice,
**afin d'** ouvrir la fiche info d'un tap sans quitter ma seance.

**Criteres d'acceptation :**
- [ ] Icone info (Ionicons `information-circle-outline`) a cote du nom
- [ ] Ouvre ExerciseInfoSheet au tap
- [ ] Haptics `onPress` au tap (via `useHaptics()`)
- [ ] Ne gene pas le flow de saisie des series
- [ ] Fonctionne pendant une seance active
- [ ] `npx tsc --noEmit` → 0 erreur

---

### US-05 — Acces depuis la bibliotheque d'exercices [SHOULD]
**En tant que** utilisateur parcourant la bibliotheque,
**je veux** pouvoir ouvrir la fiche info d'un exercice,
**afin de** lire sa description et ses muscles avant de l'ajouter a ma seance.

**Criteres d'acceptation :**
- [ ] Bouton/zone tap sur la carte exercice dans ExercisePickerScreen ou equivalent
- [ ] Ouvre le meme ExerciseInfoSheet
- [ ] Coherent visuellement avec le bouton en seance
- [ ] `npx tsc --noEmit` → 0 erreur

---

## MoSCoW

| US | Titre | Priorite |
|----|-------|----------|
| US-01 | Migration schema v21 | MUST |
| US-02 | Descriptions texte + animation_key | MUST |
| US-03 | Composant ExerciseInfoSheet | MUST |
| US-04 | Bouton info en seance | MUST |
| US-05 | Bouton info en bibliotheque | SHOULD |
| -- | Vrais assets visuels (Lottie/GIF/SVG) | WON'T (Phase 2) |
| -- | Telechargement animations supplementaires | WON'T (Phase 2) |
| -- | Mode "apprendre" interstitiel | WON'T (Phase 2) |
| -- | Contribution communautaire de tips | WON'T (Phase 2) |

---

## Contraintes non-fonctionnelles
- **Offline-first** : 0 requete reseau, tout en local
- Toutes mutations DB dans `database.write()`
- Reactivite via `withObservables` (pas de refresh manuel)
- Dark Mode uniquement (`colors.*` du theme)
- Langue : francais (fr-FR)
- Pas de native Modal → BottomSheet via Portal
- Schema migration v20 → v21 (addColumns non-destructif)
- Haptics : `useHaptics()` pour feedback tactile
- Ne pas casser : le modele Exercise existant, le flow de seance, la bibliotheque
