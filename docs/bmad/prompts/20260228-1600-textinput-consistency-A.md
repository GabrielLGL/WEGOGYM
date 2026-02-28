# Groupe A — TextInput consistency : SettingsScreen.tsx

## Fichier modifié
`mobile/src/screens/SettingsScreen.tsx`

## Problème
`StyleSheet.create({...})` (lignes 53–325) est appelé **dans le body du composant** sans `useMemo` → recrée ~270 styles à chaque frappe dans un TextInput. Sévérité : 🔴 CRITIQUE.

---

## Changements

### 1. Extraire `createStyles` en dehors du composant

Déplacer le bloc `StyleSheet.create({...})` (lignes 53–325) vers une fonction **en bas du fichier** :

```ts
function createStyles(colors: ThemeColors, neuShadow: NeuShadow) {
  return StyleSheet.create({
    // ... (contenu actuel exact, inchangé)
  })
}
```

Remplacer la déclaration inline par :

```ts
const styles = useMemo(() => createStyles(colors, neuShadow), [colors, neuShadow])
```

Ajouter `useMemo` à l'import React (ligne 1) : `import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'`

### 2. TextInput `userName` → non-contrôlé (ligne 544)

**Avant :**
```ts
const [userName, setUserName] = useState(user?.name ?? '')
```
```tsx
<TextInput
  value={userName}
  onChangeText={setUserName}
  onBlur={handleSaveName}
  ...
/>
```

**Après :**
```ts
const nameRef = useRef(user?.name ?? '')
```
```tsx
<TextInput
  defaultValue={user?.name ?? ''}
  onChangeText={val => { nameRef.current = val }}
  onBlur={handleSaveName}
  onSubmitEditing={handleSaveName}
  ...
/>
```

`handleSaveName` (ligne 358) lit `nameRef.current.trim()` au lieu de `userName.trim()` :
```ts
const handleSaveName = useCallback(async () => {
  if (!user) return
  try {
    await database.write(async () => {
      await user.update(u => {
        u.name = nameRef.current.trim() || null
      })
    })
    haptics.onSuccess()
  } catch (error) {
    if (__DEV__) console.error('Failed to update name:', error)
  }
}, [user, haptics])
```

Supprimer le `setUserName(user.name ?? '')` dans le `useEffect` (ligne 333) — plus nécessaire.

### 3. TextInput `restDuration` → non-contrôlé (ligne 706)

**Avant :**
```ts
const [restDuration, setRestDuration] = useState(user?.restDuration?.toString() ?? '90')
```
```tsx
<TextInput
  value={restDuration}
  onChangeText={setRestDuration}
  onBlur={handleSaveRestDuration}
  ...
/>
```

**Après :**
```ts
const restDurationRef = useRef(user?.restDuration?.toString() ?? '90')
```
```tsx
<TextInput
  defaultValue={user?.restDuration?.toString() ?? '90'}
  onChangeText={val => { restDurationRef.current = val }}
  onBlur={handleSaveRestDuration}
  onSubmitEditing={handleSaveRestDuration}
  keyboardType="numeric"
  ...
/>
```

`handleSaveRestDuration` (ligne 337) lit `restDurationRef.current` :
```ts
const handleSaveRestDuration = useCallback(async () => {
  if (!user) return
  const duration = parseInt(restDurationRef.current, 10)
  if (isNaN(duration) || duration < 10 || duration > 600) return
  try {
    await database.write(async () => {
      await user.update(u => { u.restDuration = duration })
    })
    haptics.onSuccess()
  } catch (error) {
    if (__DEV__) console.error('Failed to update rest duration:', error)
  }
}, [user, haptics])
```

Supprimer le `setRestDuration(...)` dans le `useEffect` (ligne 329).

### 4. Types nécessaires

Importer `ThemeColors` et le type `NeuShadow` (si non déjà importé) pour typer les paramètres de `createStyles`. Vérifier dans `theme/index.ts` les types exportés.

---

## Contraintes
- `colors` et `neuShadow` viennent de `useTheme()` → les deux en dépendances du `useMemo`
- Ne pas casser les usages de `userName`/`restDuration` dans le reste du JSX — les remplacer tous par le pattern ref
- Pas de couleurs hardcodées — `createStyles` reçoit `colors` en paramètre
- Pattern : `createStyles` (pas `useStyles`) comme dans WorkoutSummarySheet
- Handlers : `useCallback` avec dépendances correctes

---

## Vérification
```bash
npx tsc --noEmit
npm test -- --testPathPattern="SettingsScreen" --no-coverage
```
(Pas de tests connus pour SettingsScreen → la passe tsc suffit pour valider)
