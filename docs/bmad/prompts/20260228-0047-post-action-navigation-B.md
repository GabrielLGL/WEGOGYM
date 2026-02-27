<!-- v1.0 — 2026-02-28 -->
# Rapport — post-action-navigation — Groupe B — 20260228-0047

## Objectif
Après la fin d'une séance d'entraînement :
1. Naviguer immédiatement vers HomeScreen (après fermeture du résumé)
2. Afficher les célébrations (gains de niveau / milestones + badges débloqués) EN SÉQUENCE sur HomeScreen

Actuellement, l'ordre est : Résumé → MilestoneCelebration → BadgeCelebration → Home (sur WorkoutScreen)
Nouvel ordre voulu : Résumé → Home → MilestoneCelebration → BadgeCelebration (sur HomeScreen, un par un)

## Fichiers concernés
- `mobile/src/navigation/index.tsx` — RootStackParamList
- `mobile/src/screens/WorkoutScreen.tsx` — retirer les célébrations, naviguer vers Home avec les données
- `mobile/src/screens/HomeScreen.tsx` — ajouter la logique de célébrations séquentielles

## Contexte technique

### Types à importer dans HomeScreen
- `MilestoneEvent` depuis `../model/utils/gamificationHelpers`
- `BadgeDefinition` depuis `../model/utils/badgeConstants`
- `MilestoneCelebration` depuis `../components/MilestoneCelebration`
- `BadgeCelebration` depuis `../components/BadgeCelebration`

### Passage de données : navigation params
Les données de célébration seront passées via `navigation.reset()` dans WorkoutScreen :
```typescript
navigation.reset({
  index: 0,
  routes: [{
    name: 'Home',
    params: { celebrations: { milestones, badges: newBadges } }
  }]
})
```

### Structure navigation params Home
Ajouter dans `RootStackParamList` :
```typescript
Home: { celebrations?: { milestones: MilestoneEvent[]; badges: BadgeDefinition[] } } | undefined;
```

### Logique de file dans HomeScreen
Utiliser une file d'attente (queue) pour afficher les célébrations une par une :
1. Lire `route.params?.celebrations` au montage
2. Construire une queue : d'abord les milestones (index 0, 1, …), puis les badges (index 0, 1, …)
3. Afficher le premier item → quand fermé → afficher le suivant → etc.
4. Après lecture des params, les effacer avec `navigation.setParams({ celebrations: undefined })`

### Gestion de la queue
```typescript
type CelebrationItem =
  | { type: 'milestone'; data: MilestoneEvent }
  | { type: 'badge'; data: BadgeDefinition }

const [celebrationQueue, setCelebrationQueue] = useState<CelebrationItem[]>([])
const [currentCelebration, setCurrentCelebration] = useState<CelebrationItem | null>(null)
```

Quand `currentCelebration` se ferme → prendre le prochain de la queue.

### WorkoutScreen — simplification
Retirer les 3 `useEffect` liés aux célébrations (lignes ~109-146) et les remplacer par UN SEUL :
```typescript
useEffect(() => {
  if (!summaryVisible && summaryWasOpenRef.current) {
    summaryWasOpenRef.current = false
    navigation.reset({
      index: 0,
      routes: [{
        name: 'Home',
        params: milestones.length > 0 || newBadges.length > 0
          ? { celebrations: { milestones, badges: newBadges } }
          : undefined
      }]
    })
  }
}, [summaryVisible, navigation, milestones, newBadges])
```

Retirer également les JSX `<MilestoneCelebration>` et `<BadgeCelebration>` du render de WorkoutScreen.
Retirer les states `milestoneVisible`, `badgeCelebrationVisible` et `badgeCelebrationWasOpenRef` (ils ne servent plus).

### HomeScreen — accès aux params
HomeScreen utilise `useNavigation()`. Ajouter `useRoute()` :
```typescript
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native'
type HomeRoute = RouteProp<RootStackParamList, 'Home'>
// dans le composant :
const route = useRoute<HomeRoute>()
```

### Note sur withObservables
HomeScreen exporte un composant HOC `withObservables`. Le composant interne qui utilise `useRoute` doit être le composant de base (avant wrapping). Vérifier la structure existante de HomeScreen et ajouter `useRoute` dans le bon composant interne.

## Étapes
1. **Lire** `mobile/src/screens/WorkoutScreen.tsx` (lignes 80-150 et 490-510) pour confirmer la structure exacte
2. **Lire** `mobile/src/screens/HomeScreen.tsx` (complet) pour confirmer la structure du HOC et du composant interne
3. **Modifier** `mobile/src/navigation/index.tsx` : changer `Home: undefined` en `Home: { celebrations?: { milestones: MilestoneEvent[]; badges: BadgeDefinition[] } } | undefined`
4. **Modifier** `mobile/src/screens/WorkoutScreen.tsx` :
   - Remplacer les 3 useEffect de célébration (lignes ~109-146) par un seul qui navigue vers Home avec les données
   - Supprimer les states `milestoneVisible`, `badgeCelebrationVisible`, `badgeCelebrationWasOpenRef`
   - Supprimer les imports `MilestoneCelebration`, `BadgeCelebration`
   - Supprimer le JSX `<MilestoneCelebration>` et `<BadgeCelebration>`
5. **Modifier** `mobile/src/screens/HomeScreen.tsx` :
   - Ajouter les imports nécessaires (useRoute, MilestoneCelebration, BadgeCelebration, types)
   - Ajouter `useRoute()` dans le composant interne
   - Ajouter state `celebrationQueue` et `currentCelebration`
   - Ajouter `useEffect` qui lit `route.params?.celebrations` et initialise la queue, puis efface les params
   - Ajouter la logique `handleCloseCelebration` qui avance dans la queue
   - Ajouter le JSX conditionnel pour afficher `<MilestoneCelebration>` ou `<BadgeCelebration>`
   - Envelopper dans `<Portal>` si nécessaire (pattern standard du projet)

## Contraintes
- Ne jamais utiliser `<Modal>` natif (crash Fabric) — utiliser Portal via `@gorhom/portal`
- MilestoneCelebration et BadgeCelebration utilisent déjà le Portal pattern, vérifier avant d'ajouter
- Conserver le `summaryWasOpenRef` dans WorkoutScreen (logique existante pour détecter la fermeture)
- Ne pas casser `handleAbandon` dans WorkoutScreen (navigate.reset vers Home sans célébrations — déjà correct)
- Pas de `any` TypeScript
- Pas de `console.log` hors `__DEV__`
- Respecter le pattern `useColors()` et les couleurs du thème

## Critères de validation
- `npx tsc --noEmit` → zéro erreur TypeScript
- Fin de séance sans badge/milestone → arrive sur HomeScreen directement
- Fin de séance avec 1 milestone → arrive sur HomeScreen, puis milestone s'affiche, puis fermeture
- Fin de séance avec 1 badge → arrive sur HomeScreen, puis badge s'affiche, puis fermeture
- Fin de séance avec 1 milestone + 2 badges → HomeScreen → milestone → badge1 → badge2 → fin
- Abandon de séance → HomeScreen directement (pas de changement)

## Dépendances
Aucune dépendance sur Groupe A — peut tourner en parallèle.

## Statut
✅ Résolu — 20260228-0055

## Résolution
Rapport do : docs/bmad/do/20260228-0055-feat-workout-celebrations-home.md
