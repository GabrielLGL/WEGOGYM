# Limitations connues - WEGOGYM

Ce document répertorie les limitations connues de l'application qui ne sont **pas des bugs** mais des choix de design ou des contraintes techniques acceptées.

---

## 1. ChartsScreen - Minimum 2 logs pour afficher le graphique

**Fichier:** `src/screens/ChartsScreen.tsx`

**Comportement actuel:**
Le graphique ne s'affiche que si l'exercice a au moins 2 entrées de performance.

**Raison:**
- Un graphique avec 1 seul point n'est pas visuellement utile
- react-native-chart-kit requiert au moins 2 points pour tracer une ligne
- La liste d'historique affiche toujours tous les logs (même avec 1 seul)

**Impact:** Faible - L'utilisateur voit un message "Ajoutez plus de données" au lieu du graphique.

**Alternative possible:** Afficher un point isolé ou un indicateur différent pour 1 log unique.

---

## 2. RestTimer - Imprécision en arrière-plan

**Fichier:** `src/components/RestTimer.tsx`

**Comportement actuel:**
Le timer utilise `setInterval(1000ms)` qui n'est pas précis à la milliseconde.

**Limitations:**
- `setInterval` peut dériver de quelques millisecondes sur Android/iOS
- Si l'app passe en arrière-plan, le timer continue mais l'UI ne se met pas à jour
- Pas de notification native quand le timer se termine en arrière-plan

**Impact:** Faible - Pour un timer de repos (60-120 sec), une dérive de ±1-2 secondes est acceptable.

**Alternatives possibles:**
- Utiliser `Date.now()` pour calculer le temps écoulé au lieu de décompter
- Utiliser react-native-background-timer pour plus de précision
- Ajouter des notifications natives

**Décision:** Garder la solution simple (setInterval) car suffisante pour l'usage.

---

## 3. AlertDialog - Haptic feedback non configurable

**Fichier:** `src/components/AlertDialog.tsx`

**Comportement actuel:**
- Bouton "Confirmer" → Heavy haptic (onDelete)
- Bouton "Annuler" → Medium haptic (onPress)

**Limitation:**
Les haptics ne sont pas configurables par props. Tous les AlertDialog utilisent le même feedback.

**Raison:**
- Simplifie l'API du composant
- Le feedback Heavy pour confirmation est cohérent avec les actions critiques
- Peut être ajouté dans une v2 si nécessaire

**Impact:** Aucun - Le feedback actuel est approprié pour tous les cas d'usage.

**Alternative possible:**
Ajouter une prop `confirmHaptic?: 'delete' | 'success' | 'press'`

---

## 4. ErrorBoundary - Ne capture pas les erreurs asynchrones

**Fichier:** `src/components/ErrorBoundary.tsx`

**Limitation React:**
ErrorBoundary capture uniquement les erreurs de **rendu** React. Il ne capture **PAS**:
- Erreurs dans les event handlers (onClick, onPress)
- Erreurs dans les Promises/async-await
- Erreurs dans setTimeout/setInterval
- Erreurs dans les hooks (useEffect asynchrone)

**Impact:** Moyen - Certaines erreurs peuvent ne pas afficher l'écran d'erreur élégant.

**Mitigation actuelle:**
- Tous les hooks DB ont des try/catch (Phase 5 corrections)
- Console.error pour debugging
- En dev mode, React affiche un overlay rouge

**Alternative possible:**
- Ajouter un error handler global avec `ErrorUtils.setGlobalHandler` (React Native)
- Intégrer Sentry/Crashlytics pour capturer toutes les erreurs

**Décision:** Try/catch manuel est suffisant pour l'instant.

---

## 5. useMultiModalSync - Nécessite un tableau stable

**Fichier:** `src/hooks/useModalState.ts`

**Limitation:**
Le hook utilise `modalStates.join(',')` pour éviter les re-renders, mais cela signifie que l'ordre des modals dans le tableau compte.

**Impact:** Aucun en pratique - Les appels à useMultiModalSync passent toujours le même ordre de modals.

**Exemple non problématique:**
```typescript
// ✅ Ordre stable
useMultiModalSync([isAdd, isEdit, isDelete])
```

**Exemple problématique (théorique):**
```typescript
// ❌ Ordre changeant (mais ne se produit jamais en pratique)
const states = shouldShowFirst ? [isAdd, isEdit] : [isEdit, isAdd]
useMultiModalSync(states)
```

**Décision:** Limitation documentée mais non bloquante.

---

## 6. WatermelonDB - Pas de validation au runtime des fields

**Limitation WatermelonDB:**
Les champs `@field` ne sont pas validés au runtime. Si on assigne une valeur d'un mauvais type, TypeScript ne l'attrapera pas toujours.

**Mitigation actuelle:**
- Helpers de validation centralisés (`validationHelpers.ts`)
- Helpers de parsing (`databaseHelpers.ts`: parseNumericInput, parseIntegerInput)
- Validation avant toute opération DB

**Impact:** Faible - Les validations manuelles compensent cette limitation.

**Alternative possible:** Intégrer Zod pour validation runtime (overkill pour ce projet).

---

## 7. Deux versions d'ExercisesScreen (choix de design)

**Fichiers:**
- `src/screens/ExercisesScreen.tsx` (utilisé)
- `src/screens/SettingsScreen.tsx` (contient l'ancien code ExercisesScreen - maintenant remplacé)

**Statut:** ✅ **RÉSOLU** en Phase 5 - SettingsScreen a été réécrit correctement.

~~**Raison historique:** Duplication accidentelle lors du refactoring initial.~~

**Action:** ✅ Corrigé - SettingsScreen est maintenant un vrai écran de paramètres.

---

## 8. Personal Record (PR) - Calculé sur poids uniquement

**Fichier:** `src/components/SessionExerciseItem.tsx`

**Comportement:**
Le PR affiché est le poids maximum (`Math.max(weights)`) de l'historique.

**Limitations:**
- Ne prend pas en compte les séries × reps (ex: 4×10@100kg vs 3×5@105kg)
- Ne prend pas en compte le volume total (sets × reps × weight)
- Pas de calcul de 1RM (one-rep max) estimé

**Raison:**
- Simple à comprendre pour l'utilisateur ("poids max utilisé")
- Calculs avancés (1RM, volume) peuvent être ajoutés dans ChartsScreen

**Impact:** Faible - Le PR simple est suffisant pour la plupart des utilisateurs.

**Alternative possible:**
Ajouter des options de calcul PR dans Settings:
- Poids max (actuel)
- 1RM estimé (formule Epley/Brzycki)
- Volume max (sets × reps × weight)

---

## Résumé

| Limitation | Criticité | Action |
|------------|-----------|--------|
| ChartsScreen >1 log | Faible | Design choice |
| RestTimer imprécision | Faible | Acceptable |
| AlertDialog haptics | Aucune | Feature request |
| ErrorBoundary async | Moyenne | Try/catch manual |
| useMultiModalSync ordre | Aucune | Documenté |
| WatermelonDB validation | Faible | Helpers suffisants |
| ExercisesScreen v2 | ✅ Résolu | SettingsScreen réécrit |
| PR calculation simple | Faible | Feature request |

**Aucune limitation critique** - L'application est production-ready.

---

## Monitoring recommandé (optionnel)

Pour améliorer la visibilité en production:

1. **Sentry** - Capture toutes les erreurs (async, événements, etc.)
2. **Analytics** - Firebase/Mixpanel pour usage tracking
3. **Performance** - React Native Performance Monitor

Ces outils sont **optionnels** et peuvent être ajoutés plus tard selon les besoins.
