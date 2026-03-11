<!-- v1.0 — 2026-03-11 -->
# Rapport — Widget Android — Groupe A — Foundation & Config — 20260311-1835

## Objectif
Installer et configurer `react-native-android-widget` dans le projet Expo géré (EAS Build).
Créer le squelette du widget avec le task handler et l'enregistrement dans index.js.

## Fichiers concernés
- `mobile/package.json` — ajout dépendance
- `mobile/app.json` — ajout plugin Expo
- `mobile/index.js` — enregistrement task handler
- `mobile/src/widgets/KoreWidgetTaskHandler.tsx` — nouveau fichier (task handler)
- `mobile/src/widgets/KoreWidget.tsx` — nouveau fichier (UI widget placeholder)

## Contexte technique
- Projet Expo 52 managed workflow, EAS Build, New Architecture (Fabric)
- react-native-android-widget v0.x utilise Jetpack Glance (Compose) sous le hood
- Le widget s'intègre via un Expo config plugin automatique fourni par le package
- L'enregistrement du handler se fait dans index.js (point d'entrée) via `registerWidgetTaskHandler`
- Le widget est un composant React Native rendu côté natif (pas de JSX standard — API spécifique)
- TypeScript strict (pas de `any`)

## Étapes

### 1. Installer le package
```bash
cd mobile
npm install react-native-android-widget
```

### 2. Configurer app.json
Ajouter dans `mobile/app.json`, section `expo.plugins` :
```json
[
  "react-native-android-widget",
  {
    "widgets": [
      {
        "name": "KoreWidget",
        "label": "Kore — Streak & Workout",
        "description": "Affiche le streak actuel et le prochain workout",
        "minWidth": "180dp",
        "minHeight": "110dp",
        "targetCellWidth": 3,
        "targetCellHeight": 2,
        "updatePeriodMillis": 1800000,
        "previewImage": "./assets/widget-preview.png",
        "widgetFeatures": ["reconfigurable", "configuration_optional"]
      }
    ]
  }
]
```

### 3. Créer le widget placeholder UI
Créer `mobile/src/widgets/KoreWidget.tsx` :
- Utiliser les primitives de `react-native-android-widget` : `FlexWidget`, `TextWidget`, `ImageWidget`
- Afficher uniquement un placeholder "Kore Widget" pour l'instant (données injectées au Groupe C)
- Respecter la palette dark : background #1C1C1E, text blanc, accent #FF6B35 (couleur primary du thème)
- Ne PAS importer depuis `theme/index.ts` — le widget est hors contexte React Native normal, utiliser des valeurs littérales issues de `colors` dans `theme/index.ts`

### 4. Créer le task handler
Créer `mobile/src/widgets/KoreWidgetTaskHandler.tsx` :
```typescript
import { WidgetTaskHandler } from 'react-native-android-widget'
import { KoreWidget } from './KoreWidget'

// Appelé par le système Android pour mettre à jour le widget
export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  const widgetInfo = props.widgetInfo
  switch (props.widgetAction) {
    case 'WIDGET_ADDED':
    case 'WIDGET_UPDATE':
    case 'WIDGET_RESIZED':
      props.renderWidget(<KoreWidget streak={0} nextWorkoutName="—" />)
      break
    case 'WIDGET_DELETED':
      break
    default:
      break
  }
}
```

### 5. Enregistrer dans index.js
Dans `mobile/index.js`, ajouter AVANT le `registerRootComponent` :
```javascript
import { registerWidgetTaskHandler } from 'react-native-android-widget'
import { widgetTaskHandler } from './src/widgets/KoreWidgetTaskHandler'

registerWidgetTaskHandler(widgetTaskHandler)
```

### 6. Créer l'image de preview
Copier une image placeholder dans `mobile/assets/widget-preview.png` (ou utiliser une existante).

## Contraintes
- Ne pas casser : app.json existant (merger correctement la section plugins)
- Ne pas utiliser `<Modal>` natif
- Pas de `any` TypeScript
- Pas de hardcoded colors — utiliser les valeurs hex de `theme/index.ts` directement (pas l'import)
- Le widget UI ne peut PAS utiliser les composants React Native standards (View, Text) — uniquement les primitives de react-native-android-widget

## Critères de validation
- `cd mobile && npx tsc --noEmit` → zéro erreur
- `npm test` → zéro fail (pas de nouveau test requis pour ce groupe)
- `app.json` contient la config plugin widget
- `mobile/index.js` enregistre le handler
- Les deux nouveaux fichiers compilent sans erreur TypeScript

## Dépendances
Aucune dépendance sur d'autres groupes.

## Statut
⏳ En attente
