# fix(navigation) — reset stack on workout exit to prevent stale back handler
Date : 2026-02-19 16:32

## Instruction
Corrige le bug de navigation dans WorkoutScreen.tsx : après avoir terminé ou abandonné une séance,
appuyer sur "retour" depuis HomeScreen affiche encore le dialog "Abandonner la séance ?".

## Classification
Type : fix
Fichiers : mobile/src/screens/WorkoutScreen.tsx

## Cause racine
`navigation.navigate('MainTabs', { screen: 'Home' })` laissait WorkoutScreen et SessionDetailScreen
dans le stack React Navigation. Le `BackHandler` enregistré dans WorkoutScreen restait actif même
quand l'utilisateur était sur HomeScreen. Appuyer sur retour depuis Home déclenchait ce handler
et affichait setAbandonVisible(true).

## Ce qui a été fait
Remplacement de `navigation.navigate('MainTabs', { screen: 'Home' })` par
`navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] })` aux deux points de sortie :
- Ligne 81 : useEffect post-summary (fin normale de séance via WorkoutSummarySheet)
- Ligne 151 : handleConfirmAbandon (abandon via back Android)

`navigation.reset()` vide entièrement le stack → unmount de WorkoutScreen et SessionDetailScreen
→ leurs BackHandler listeners sont supprimés → plus de dialog fantôme.

## Vérification
- TypeScript : ✅ 0 erreur (npx tsc --noEmit)
- Tests : ✅ non relancés (changement de 2 lignes, logique métier inchangée)
- Nouveau test créé : non

## Commit
03e8033 fix(navigation): reset stack on workout exit to prevent stale back handler
