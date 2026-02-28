# perf(SettingsScreen) — TextInput non-contrôlé + createStyles memoïsé
Date : 2026-02-28 16:00

## Instruction
docs/bmad/prompts/20260228-1600-textinput-consistency-A.md

## Rapport source
description directe (prompt généré depuis /prompt)

## Classification
Type : perf
Fichiers modifiés :
- `mobile/src/screens/SettingsScreen.tsx`

## Ce qui a été fait

1. **Import React** — ajout de `useRef`, `useCallback`, `useMemo`
2. **Import theme** — ajout de `type ThemeColors`, `getThemeNeuShadow`
3. **`createStyles` extrait** — le bloc `StyleSheet.create` (~270 styles, lignes 53–325) déplacé vers une fonction `createStyles(colors, neuShadow)` en bas du fichier
4. **`useMemo`** — `const styles = useMemo(() => createStyles(colors, neuShadow), [colors, neuShadow])` dans le corps du composant
5. **`userName` → ref** — `const [userName, setUserName]` remplacé par `const nameRef = useRef(user?.name ?? '')`. TextInput passe à `defaultValue` + `onChangeText={val => { nameRef.current = val }}`
6. **`restDuration` → ref** — `const [restDuration, setRestDuration]` remplacé par `const restDurationRef = useRef(...)`. TextInput passe à `defaultValue` + `onChangeText={val => { restDurationRef.current = val }}`
7. **Handlers** — `handleSaveName` et `handleSaveRestDuration` wrappés dans `useCallback`, lisent les refs au lieu des states
8. **`useEffect` nettoyé** — suppressions de `setUserName` et `setRestDuration` (refs ne nécessitent pas de reset au changement de `user`)

## Vérification
- TypeScript : ✅ zéro erreur
- Tests : ✅ 32 passed (SettingsScreen)
- Nouveau test créé : non (pas de tests cassés, couverture suffisante)

## Documentation mise à jour
aucune

## Statut
✅ Résolu — 20260228-1600

## Commit
55f83b3 perf(SettingsScreen): createStyles memoïsé + TextInputs non-contrôlés
