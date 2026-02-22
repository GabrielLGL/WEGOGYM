<!-- v1.0 — 2026-02-22 -->
# Rapport — Supprimer Tab Bar — Groupe A — 20260222-2300

## Objectif
Supprimer le Bottom Tab Navigator et restructurer la navigation pour que tous les ecrans soient des Stack Screens. Le HomeScreen (dashboard) devient l'ecran d'accueil principal, et la navigation se fait uniquement via les tuiles du dashboard.

## Fichiers concernes
- `mobile/src/navigation/index.tsx` (PRINCIPAL)

## Contexte technique
- L'app utilise React Navigation 7 avec Native Stack + Bottom Tabs.
- Le `TabNavigator` contient 4 onglets : Exercices, Home, Assistant, Stats.
- Le HomeScreen sert deja de hub dashboard avec des tuiles de navigation vers TOUTES les sections.
- La tab bar est donc redondante — le dashboard suffit.
- ProgramsScreen existe deja (`mobile/src/screens/ProgramsScreen.tsx`) mais n'est PAS enregistre dans le RootStack.
- Imports existants : `ProgramsScreen` n'est PAS importe dans `navigation/index.tsx` — il faut l'ajouter.

## Etapes

### 1. Supprimer les imports tab bar
- Retirer `import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'`
- Retirer `Keyboard, Animated, DeviceEventEmitter` des imports React Native (plus besoin pour l'animation tab bar)
- Garder `BackHandler, ToastAndroid, Platform, View, Text, TouchableOpacity` (utilises par GlobalBackHandler et headers)

### 2. Mettre a jour RootStackParamList
Remplacer le type existant par :
```typescript
export type RootStackParamList = {
  Home: undefined;
  Programs: undefined;
  Exercices: undefined;
  Assistant: undefined;
  Stats: undefined;
  SessionDetail: { sessionId: string };
  Settings: undefined;
  Workout: { sessionId: string };
  StatsDuration: undefined;
  StatsVolume: undefined;
  StatsCalendar: undefined;
  StatsRepartition: undefined;
  StatsExercises: undefined;
  StatsMeasurements: undefined;
  StatsHistory: undefined;
};
```

### 3. Supprimer MainTabParamList
- Retirer `export type MainTabParamList = { ... }` entierement.
- Retirer `const Tab = createBottomTabNavigator<MainTabParamList>()`

### 4. Mettre a jour GlobalBackHandler
- Ligne 113 : `DeviceEventEmitter.emit('SHOW_TAB_BAR')` → SUPPRIMER cette ligne
- Ligne 115 : `nav.navigate('MainTabs', { screen: 'Home' })` → `nav.navigate('Home')`
- La logique double-tap pour quitter reste identique

### 5. Supprimer la fonction TabNavigator entierement
Supprimer toute la function `TabNavigator` (lignes 134-215), incluant :
- L'animation scrollY
- Les listeners keyboard
- Les listeners HIDE_TAB_BAR / SHOW_TAB_BAR
- Le Tab.Navigator JSX

### 6. Ajouter l'import ProgramsScreen
```typescript
import ProgramsScreen from '../screens/ProgramsScreen'
```

### 7. Mettre a jour le Stack.Navigator dans AppNavigator
Remplacer le contenu du Stack.Navigator par :
```tsx
<Stack.Navigator
  initialRouteName="Home"
  screenOptions={{
    headerStyle: { backgroundColor: colors.background },
    headerTintColor: colors.text,
    contentStyle: { backgroundColor: colors.background },
  }}
>
  {/* Dashboard principal */}
  <Stack.Screen
    name="Home"
    component={HomeScreen}
    options={({ navigation: nav }) => ({
      headerTitle: 'WEGOGYM',
      headerTitleAlign: 'left',
      headerTitleStyle: { fontSize: 22, fontWeight: 'bold', color: colors.text },
      headerRight: () => (
        <TouchableOpacity
          style={{ marginRight: 20, padding: 5 }}
          onPress={() => { nav.navigate('Settings'); }}
        >
          <Text style={{ fontSize: 24 }}>⚙️</Text>
        </TouchableOpacity>
      ),
    })}
  />
  {/* Ecrans principaux (ex-onglets) */}
  <Stack.Screen name="Programs" component={ProgramsScreen} options={{ title: 'Programmes' }} />
  <Stack.Screen name="Exercices" component={ExercisesScreen} options={{ title: 'Bibliotheque' }} />
  <Stack.Screen name="Assistant" component={AssistantScreen} options={{ title: 'Assistant IA' }} />
  <Stack.Screen name="Stats" component={StatsScreen} options={{ title: 'Statistiques' }} />
  {/* Ecrans de detail */}
  <Stack.Screen name="SessionDetail" component={SessionDetailScreen} options={{ title: 'Gestion de la seance' }} />
  <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Parametres' }} />
  <Stack.Screen name="Workout" component={WorkoutScreen} options={{ title: '' }} />
  <Stack.Screen name="StatsDuration" component={StatsDurationScreen} options={{ title: 'Duree des seances' }} />
  <Stack.Screen name="StatsVolume" component={StatsVolumeScreen} options={{ title: "Volume d'entrainement" }} />
  <Stack.Screen name="StatsCalendar" component={StatsCalendarScreen} options={{ title: "Calendrier d'activite" }} />
  <Stack.Screen name="StatsRepartition" component={StatsRepartitionScreen} options={{ title: 'Repartition musculaire' }} />
  <Stack.Screen name="StatsExercises" component={StatsExercisesScreen} options={{ title: 'Exercices & Records' }} />
  <Stack.Screen name="StatsMeasurements" component={StatsMeasurementsScreen} options={{ title: 'Mesures corporelles' }} />
  <Stack.Screen name="StatsHistory" component={ChartsScreen} options={{ title: 'Historique' }} />
</Stack.Navigator>
```

### 8. Nettoyer les imports inutiles
Apres suppression du TabNavigator, retirer les imports devenus inutiles :
- `Keyboard` (plus de listeners clavier pour tab bar)
- `Animated` (plus d'animation tab bar)
- `DeviceEventEmitter` (plus d'events tab bar) — SAUF si GlobalBackHandler l'utilise encore. Verifier apres suppression de la ligne 113.
- `NativeStackScreenProps` de `@react-navigation/native-stack` (etait utilise par TabNavigator props)

## Contraintes
- Ne pas casser : GlobalBackHandler (double-tap exit), PortalProvider, ErrorBoundary, NavigationContainer
- Garder le theme sombre MyDarkTheme
- Respecter : CLAUDE.md patterns, pas de hardcoded colors
- L'import de `useHaptics` dans GlobalBackHandler doit rester

## Criteres de validation
- `npx tsc --noEmit` → zero erreur
- `npm test` → zero fail
- L'app demarre sur HomeScreen (dashboard)
- Toutes les tuiles du dashboard naviguent correctement
- Bouton retour Android ramene au Home, double-tap quitte
- Plus aucune tab bar visible en bas de l'ecran
- Le bouton settings (roue crantee) est dans le header du HomeScreen

## Dependances
Aucune dependance — ce groupe peut etre lance en premier.

## Statut
⏳ En attente
