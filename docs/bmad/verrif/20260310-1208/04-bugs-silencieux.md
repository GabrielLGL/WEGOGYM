# Passe 4/8 — Bugs silencieux

## Issues trouvées : 1

### 🔴 B1 — State Update After Unmount (ExerciseCatalogScreen)
**Fichier :** `screens/ExerciseCatalogScreen.tsx:324-332`
**Description :** loadInitial vérifie `controller.signal.aborted` mais pas si le composant est démonté. Si le fetch réussit après unmount, setIsLoading(false) peut s'exécuter.
**Fix :** Ajouter isMountedRef check

## Codebase globalement sain
- ✅ Toutes mutations WDB dans database.write()
- ✅ Tous setTimeout/setInterval ont cleanup
- ✅ Tous .subscribe()/.observe() gérés par withObservables
- ✅ Race conditions prévenues avec cancelled flags
- ✅ Console statements gardés par __DEV__
