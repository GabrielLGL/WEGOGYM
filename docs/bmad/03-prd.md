# PRD — Récap Post-Séance — 2026-02-26

## Vue d'ensemble
Enrichissement du WorkoutSummarySheet avec un message motivant contextuel, les muscles travaillés, le détail exercice par exercice et la comparaison avec la dernière séance.

---

## User Stories & Critères d'acceptation

### US-1 — Message motivant + muscles travaillés [MUST]
**En tant qu'** utilisateur, je veux voir un message d'encouragement contextuel et les muscles travaillés dès l'ouverture du récap.

**Critères d'acceptation :**
- [ ] AC1.1 : Message en haut du sheet (remplace celebrationText). Règles : totalPrs > 0 → "🏅 Record battu !" (colors.primary) ; volumeGain > 0 → "🔺 En progression !" (colors.success) ; sinon → "💪 Bonne séance !" (colors.success)
- [ ] AC1.2 : Chips muscles travaillés sous le message (parsées depuis exercises.muscles). Si aucun muscle → section masquée.
- [ ] AC1.3 : Chips non-interactives, sans onPress.
- [ ] AC1.4 : Remplace le celebrationText existant.

---

### US-2 — Détail exercice par exercice [MUST]
**En tant qu'** utilisateur, je veux voir la liste de tous les exercices avec les séries validées (reps × poids).

**Critères d'acceptation :**
- [ ] AC2.1 : Section "Ce que tu as fait" après la grille gamification.
- [ ] AC2.2 : Pour chaque exercice (ordre = position) : nom + sets validés (reps × poids kg). Sets sans validated_at ignorés.
- [ ] AC2.3 : Exercices sans set validé non affichés.
- [ ] AC2.4 : Si 0 set validé total → section masquée.
- [ ] AC2.5 : Données passées en props depuis WorkoutScreen (pas de requête DB dans le composant).

---

### US-3 — Comparaison avec la dernière séance [MUST + SHOULD]
**En tant qu'** utilisateur, je veux savoir si j'ai fait plus ou moins que la dernière fois.

**Critères d'acceptation :**
- [ ] AC3.1 : Section "Progression" après la section exercices.
- [ ] AC3.2 (MUST) : Delta volume total. Format : "+3.2 kg vs dernière fois 🔺" (colors.success) / "-1.5 kg 🔻" (colors.danger) / "Même volume" (neutre).
- [ ] AC3.3 (MUST) : Pas d'historique précédent → "Première séance ! 🎉".
- [ ] AC3.4 (SHOULD) : Delta poids max par exercice. Format : "Développé couché : 80 → 82.5 kg 🔺". Si identique → omis.
- [ ] AC3.5 : Calcul dans WorkoutScreen avant ouverture du sheet (helper dans databaseHelpers.ts).

---

### US-4 — Indicateur de complétion [SHOULD]
**En tant qu'** utilisateur, je veux voir combien de séries j'ai validées par rapport aux prévues.

**Critères d'acceptation :**
- [ ] AC4.1 : "(3/4)" si incomplet, ✅ si 100%, affiché à côté du nom exercice.
- [ ] AC4.2 : Total prévu depuis session_exercise.sets_target.

---

## MoSCoW

| Story | Priorité |
|-------|----------|
| US-1 Message + muscles | Must |
| US-2 Détail exo par exo | Must |
| US-3 Comparaison volume | Must |
| US-3 Delta poids max par exo | Should |
| US-4 Indicateur complétion | Should |
| Récaps depuis historique | Won't (V2) |
| Score qualité | Won't (V2) |

---

## Contraintes non-fonctionnelles
- Aucune migration de schéma (v17 suffit)
- Offline-first : 0 requête réseau
- Dark Mode uniquement (colors.* du theme)
- Langue : français (fr-FR)
- Ne pas casser : WorkoutScreen, WorkoutSummarySheet, flow de navigation existant
