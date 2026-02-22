<!-- v1.0 — 2026-02-22 -->
# Rapport — Choix Soi-même/Automatique — Groupe B — 20260222-1430

## Objectif
Quand l'utilisateur clique sur "Créer un Programme" dans ProgramsScreen, afficher un BottomSheet avec 2 options :
1. **"Soi-même"** (✏️) → ouvre le modal actuel de saisie du nom de programme (comportement existant)
2. **"Automatique"** (✨) → navigue vers l'écran Assistant (`navigation.navigate('Assistant')`)

Cela remplace le comportement actuel où le clic ouvre directement le modal de saisie.

## Fichiers concernés
- `mobile/src/screens/ProgramsScreen.tsx`

## Contexte technique
- ProgramsScreen utilise déjà le composant `<BottomSheet>` (importé ligne 13).
- Le bouton "Créer un Programme" est aux lignes 222-232 et fait `setIsProgramModalVisible(true)`.
- Le modal de saisie du nom est le `<CustomModal>` lignes 237-260 (gère création ET renommage via `isRenamingProgram`).
- L'écran Assistant est déjà enregistré dans la navigation (`navigation/index.tsx` ligne 149, route 'Assistant').
- Le composant a accès à `navigation` via les props.
- Pattern obligatoire : utiliser `<BottomSheet>` avec `<Portal>` (pas de native Modal).
- Haptics : utiliser `haptics.onPress()` sur les sélections.

## Étapes
1. Lire `mobile/src/screens/ProgramsScreen.tsx`.
2. Ajouter un nouvel état local pour le BottomSheet de choix :
   ```tsx
   const [isCreateChoiceVisible, setIsCreateChoiceVisible] = useState(false)
   ```
3. Modifier le bouton "Créer un Programme" (ligne 225-228) pour ouvrir le BottomSheet de choix au lieu du modal directement :
   ```tsx
   onPress={() => {
     haptics.onPress()
     setIsCreateChoiceVisible(true)  // au lieu de setIsProgramModalVisible(true)
   }}
   ```
4. Ajouter le BottomSheet de choix (avant les autres modales, après le footer) :
   ```tsx
   <BottomSheet
     visible={isCreateChoiceVisible}
     onClose={() => setIsCreateChoiceVisible(false)}
     title="Créer un programme"
   >
     <TouchableOpacity
       style={styles.sheetOption}
       onPress={() => {
         haptics.onPress()
         setIsCreateChoiceVisible(false)
         setIsRenamingProgram(false)
         setProgramNameInput('')
         setIsProgramModalVisible(true)
       }}
     >
       <Text style={styles.sheetOptionIcon}>✏️</Text>
       <Text style={styles.sheetOptionText}>Soi-même</Text>
     </TouchableOpacity>
     <TouchableOpacity
       style={styles.sheetOption}
       onPress={() => {
         haptics.onPress()
         setIsCreateChoiceVisible(false)
         navigation.navigate('Assistant')
       }}
     >
       <Text style={styles.sheetOptionIcon}>✨</Text>
       <Text style={styles.sheetOptionText}>Automatique</Text>
     </TouchableOpacity>
   </BottomSheet>
   ```
5. Ajouter `isCreateChoiceVisible` au BackHandler (ligne 86-105) pour le fermer avec le bouton retour Android :
   ```tsx
   if (isCreateChoiceVisible) {
     setIsCreateChoiceVisible(false)
     return true
   }
   ```
   Et l'ajouter aux dépendances du useEffect (ligne 105).
6. Vérifier `npx tsc --noEmit` → zéro erreur.

## Contraintes
- NE PAS modifier `HomeScreen.tsx` (c'est le Groupe A)
- NE PAS modifier `navigation/index.tsx`
- Utiliser `<BottomSheet>` existant (PAS de native Modal — constraint Fabric)
- Réutiliser les styles existants (`styles.sheetOption`, `styles.sheetOptionIcon`, `styles.sheetOptionText`)
- Le modal de création "Soi-même" doit rester identique (CustomModal avec TextInput)
- Le renommage de programme existant ne doit pas être impacté (passe toujours par `isRenamingProgram`)
- Haptics : `haptics.onPress()` sur chaque option

## Critères de validation
- `npx tsc --noEmit` → zéro erreur
- Clic "Créer un Programme" → ouvre un BottomSheet avec 2 options
- "Soi-même" → ouvre le modal de saisie du nom (comportement identique à avant)
- "Automatique" → navigue vers l'écran Assistant
- Bouton retour Android ferme le BottomSheet de choix
- Le renommage de programme existant fonctionne toujours

## Dépendances
Aucune dépendance — peut être exécuté en parallèle avec Groupe A.

## Statut
✅ Résolu — 20260222-2330

## Résolution
Rapport do : docs/bmad/do/20260222-2330-feat-programs-create-choice.md
