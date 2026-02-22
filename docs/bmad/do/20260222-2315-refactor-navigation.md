# REFACTOR(navigation) — Supprimer Tab Bar, restructurer en Stack-only
Date : 2026-02-22 23:15

## Instruction
docs/bmad/prompts/20260222-2300-remove-tabbar-A.md

## Rapport source
docs/bmad/prompts/20260222-2300-remove-tabbar-A.md

## Classification
Type : refactor
Fichiers modifiés :
- `mobile/src/navigation/index.tsx` (principal)
- `mobile/src/screens/HomeScreen.tsx`
- `mobile/src/screens/StatsScreen.tsx`
- `mobile/src/screens/AssistantScreen.tsx`
- `mobile/src/screens/WorkoutScreen.tsx`
- `mobile/src/screens/__tests__/HomeScreen.test.tsx`
- `CLAUDE.md`

## Ce qui a été fait
1. **navigation/index.tsx** : Supprimé `createBottomTabNavigator`, `MainTabParamList`, `TabNavigator` function, imports inutiles (`Keyboard`, `Animated`, `DeviceEventEmitter`, `View`, `NativeStackScreenProps`). Mis à jour `RootStackParamList` avec tous les écrans (Home, Programs, Exercices, Assistant, Stats, etc.). Ajouté import `ProgramsScreen`. Remplacé le Stack.Navigator pour avoir Home comme `initialRouteName` avec header "WEGOGYM" et bouton settings. Tous les ex-onglets sont maintenant des Stack Screens. `GlobalBackHandler` : supprimé `DeviceEventEmitter.emit('SHOW_TAB_BAR')`, `nav.navigate('MainTabs', { screen: 'Home' })` → `nav.navigate('Home')`.

2. **HomeScreen.tsx** : Simplifié le type de navigation (`NativeStackNavigationProp` au lieu de `CompositeNavigationProp`). Supprimé `TAB_ROUTES` set et la distinction tab/stack dans `handleTilePress` — toutes les routes sont désormais dans le même stack. Retiré imports `BottomTabNavigationProp`, `CompositeNavigationProp`, `MainTabParamList`.

3. **StatsScreen.tsx** : Même simplification du type de navigation. Retiré imports `BottomTabNavigationProp`, `CompositeNavigationProp`, `MainTabParamList`.

4. **AssistantScreen.tsx** : Remplacé `BottomTabScreenProps<MainTabParamList>` par `NativeStackNavigationProp<RootStackParamList>`. Supprimé `navigation.getParent()` (plus besoin, même stack). Retiré imports `BottomTabScreenProps`, `NavigationProp`, `MainTabParamList`.

5. **WorkoutScreen.tsx** : Remplacé `navigation.reset({ routes: [{ name: 'MainTabs' }] })` par `navigation.reset({ routes: [{ name: 'Home' }] })` (2 occurrences).

6. **HomeScreen.test.tsx** : Mis à jour l'assertion de navigation tab : `('MainTabs', { screen: 'Assistant' })` → `('Assistant')`.

7. **CLAUDE.md** : Mis à jour section 1 Nav pour refléter "Native Stack only — no Bottom Tabs".

## Vérification
- TypeScript : ✅ 0 erreur
- Tests : ✅ 840 passed (47 suites)
- Nouveau test créé : non (tests existants adaptés)

## Documentation mise à jour
- CLAUDE.md (section 1 Nav)

## Statut
✅ Résolu — 20260222-2315

## Commit
[sera rempli après commit]
