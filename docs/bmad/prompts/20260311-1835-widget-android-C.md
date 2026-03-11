<!-- v1.0 — 2026-03-11 -->
# Rapport — Widget Android — Groupe C — Widget UI & Intégration — 20260311-1835

## Objectif
Finaliser l'UI du widget Android (streak + prochain workout) et brancher les données réelles
du service `widgetDataService.ts`. Le widget doit s'afficher correctement sur l'écran d'accueil Android.

## Fichiers concernés
- `mobile/src/widgets/KoreWidget.tsx` — finaliser l'UI avec les vraies données
- `mobile/src/widgets/KoreWidgetTaskHandler.tsx` — charger les données et passer au composant
- `mobile/src/model/utils/statsHelpers.ts` — lecture uniquement (pas de modif)

## Contexte technique
- Dépend de : **Groupe A** (package installé, KoreWidget.tsx + KoreWidgetTaskHandler.tsx créés comme placeholders)
- Dépend de : **Groupe B** (`widgetDataService.ts` créé avec `loadWidgetData()` et `WidgetData` type)
- `react-native-android-widget` : les composants disponibles sont `FlexWidget`, `TextWidget`, `ImageWidget`, `SvgWidget`, `ListWidget`
- Le widget tourne dans un contexte isolé — PAS d'accès à WatermelonDB directement, PAS de React Context, PAS de hooks React
- Les données viennent UNIQUEMENT d'AsyncStorage via `loadWidgetData()` du service Groupe B
- Taille cible : 3×2 cellules Android (~280dp × 110dp)
- Design : dark background avec couleurs du thème Kore

### Couleurs Kore (valeurs hex directes — ne pas importer theme/index.ts dans le widget)
```
background: #1C1C1E
card: #2C2C2E
primary: #FF6B35 (orange Kore)
text: #FFFFFF
textSecondary: #8E8E93
success: #30D158 (vert — streak actif)
border: rgba(255,255,255,0.1)
```

### Structure visuelle cible
```
┌─────────────────────────────────────┐
│  🔥 Streak    │  💪 Prochain        │
│  5 semaines   │  Séance Jambes      │
│  ●●●○○ 3/5    │  8 exercices        │
│               │                     │
│  Niv. 12      │  [Commencer →]      │
└─────────────────────────────────────┘
```

## Étapes

### 1. Finaliser `KoreWidget.tsx`

Remplacer le placeholder par le vrai composant UI.

**Props interface :**
```typescript
interface KoreWidgetProps {
  streak: number
  streakTarget: number
  level: number
  nextWorkoutName: string | null
  nextWorkoutExerciseCount: number
}
```

**Layout avec `FlexWidget` :**
- Conteneur root : FlexWidget direction="row", background `#1C1C1E`, padding 16, borderRadius 16
- Section gauche (streak) : FlexWidget direction="column", flex 1
  - TextWidget "🔥 Streak" fontSize 12, color `#8E8E93`
  - TextWidget `${streak} sem.` fontSize 22 bold, color `#FF6B35`
  - TextWidget `Niv. ${level}` fontSize 11, color `#8E8E93`
- Séparateur : FlexWidget width 1, background `rgba(255,255,255,0.1)`, marginHorizontal 12
- Section droite (workout) : FlexWidget direction="column", flex 1
  - TextWidget "💪 Prochain" fontSize 12, color `#8E8E93`
  - TextWidget du nom de session (ou "—" si null), fontSize 15 bold, color `#FFFFFF`, numberOfLines 1
  - TextWidget `${exerciseCount} exercices` fontSize 11, color `#8E8E93`
- Si `nextWorkoutName === null` → afficher "Aucun programme actif" en italique

### 2. Mettre à jour `KoreWidgetTaskHandler.tsx`

Charger les données via `loadWidgetData()` et les passer au widget :

```typescript
import { loadWidgetData } from '../services/widgetDataService'
import { KoreWidget } from './KoreWidget'

export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  switch (props.widgetAction) {
    case 'WIDGET_ADDED':
    case 'WIDGET_UPDATE':
    case 'WIDGET_RESIZED': {
      const data = await loadWidgetData()
      props.renderWidget(
        <KoreWidget
          streak={data?.streak ?? 0}
          streakTarget={data?.streakTarget ?? 3}
          level={data?.level ?? 1}
          nextWorkoutName={data?.nextWorkoutName ?? null}
          nextWorkoutExerciseCount={data?.nextWorkoutExerciseCount ?? 0}
        />
      )
      break
    }
    case 'WIDGET_DELETED':
      break
    default:
      break
  }
}
```

### 3. Vérifier l'export dans index.js

S'assurer que `mobile/index.js` enregistre bien le handler (fait en Groupe A) — vérification uniquement.

### 4. Test visuel (optionnel si émulateur dispo)
- Builder l'app avec `npm run android`
- Ajouter le widget sur l'écran d'accueil Android
- Vérifier l'affichage des données streak et prochain workout

## Contraintes
- Ne PAS utiliser `View`, `Text`, `StyleSheet` de React Native — uniquement les primitives de `react-native-android-widget`
- Pas de hooks React dans le task handler (code async pur)
- Pas de `any` TypeScript
- Le widget doit fonctionner même si AsyncStorage retourne `null` (données par défaut affichées)
- Pas de crash si le package n'est pas encore configuré (envelopper dans try/catch si nécessaire)
- Pas de hardcoded colors hors des valeurs listées ci-dessus (cohérentes avec `theme/index.ts`)

## Critères de validation
- `cd mobile && npx tsc --noEmit` → zéro erreur
- `npm test` → zéro fail
- `KoreWidget.tsx` accepte les props `KoreWidgetProps` sans erreur TypeScript
- Le task handler charge les données et les passe correctement au widget
- Comportement gracieux si `loadWidgetData()` retourne `null`

## Dépendances
Ce groupe dépend de :
- **Groupe A** — package installé, fichiers placeholders créés
- **Groupe B** — `widgetDataService.ts` avec `loadWidgetData()` et type `WidgetData`

**Lancer APRÈS Groupe A et Groupe B.**

## Statut
⏳ En attente
