# Tache J — Loading states sur les ecrans async — 20260319-1900

## Objectif
Ajouter des etats de chargement visuels sur les ecrans qui font des calculs ou fetches async avant d'afficher du contenu. Actuellement, certains ecrans affichent un ecran vide pendant le calcul.

## Fichier a creer
- `mobile/src/components/ScreenLoading.tsx` — composant de chargement reutilisable (different de ScreenLoader qui est pour Suspense)

## Fichiers a modifier
Les ecrans stats qui ont un `useMemo` ou `useEffect` async avec un etat initial null/vide :
- `mobile/src/screens/StatsCalendarScreen.tsx` — calcul du calendrier mensuel
- `mobile/src/screens/StatsVolumeScreen.tsx` — calcul des volumes hebdo
- `mobile/src/screens/StatsStrengthScreen.tsx` — calcul des standards de force
- `mobile/src/screens/StatsConstellationScreen.tsx` — calcul de la constellation
- `mobile/src/screens/StatsCompareScreen.tsx` — calcul de comparaison

## Contexte technique

### Design system
- Couleurs : `colors.placeholder`, `colors.background`, `colors.card`
- Spacing : `spacing.xl` (32)
- Le composant `ScreenLoader` (`components/ScreenLoader.tsx`) existe deja pour Suspense mais n'est pas utilise pour les etats de chargement internes

### Spec du composant ScreenLoading

```tsx
interface ScreenLoadingProps {
  message?: string  // optionnel, ex: "Calcul en cours..."
}
```

- Centre vertical et horizontal
- `ActivityIndicator` de React Native (size="large", color=`colors.primary`)
- Message optionnel en `fontSize.sm`, couleur `colors.textSecondary`
- Background transparent (pour s'integrer dans le SafeAreaView du parent)

### Pattern d'integration

Chaque ecran stats a generalement cette structure :
```tsx
const data = useMemo(() => computeX(sets, histories), [sets, histories])

if (!data) return <SafeAreaView style={styles.container}><ScreenLoading /></SafeAreaView>

return (
  <SafeAreaView style={styles.container}>
    {/* contenu normal */}
  </SafeAreaView>
)
```

Ou pour les useEffect async :
```tsx
const [data, setData] = useState<XResult | null>(null)

useEffect(() => {
  computeAsync().then(setData)
}, [])

if (!data) return <SafeAreaView style={styles.container}><ScreenLoading /></SafeAreaView>
```

### Notes par ecran

**StatsCalendarScreen** — Le calendrier se calcule en useMemo a partir des histories. Si histories est vide au premier render (avant que withObservables ne stream), il y a un flash vide. Ajouter un loading state conditionnel.

**StatsVolumeScreen** — Meme pattern : volumeData est calcule en useMemo. Si null au premier render, montrer le loading.

**StatsStrengthScreen** — Calculs de force relative. Peut etre null si pas de donnees utilisateur.

**StatsConstellationScreen** — Calcul complexe (graph). Loading naturel.

**StatsCompareScreen** — Comparaison entre periodes. Calcul potentiellement lourd.

**ATTENTION** : Beaucoup de ces ecrans utilisent `withObservables` qui stream les donnees. Le "loading" est souvent < 100ms. Le ScreenLoading ne doit pas flasher — verifier si un loading state est vraiment necessaire en lisant le code. Si les donnees arrivent immediatement via le stream, ne PAS ajouter de loading inutile.

## Etapes
1. Creer `ScreenLoading.tsx`
2. Lire chaque ecran cible pour verifier si un loading state est pertinent
3. Ajouter le loading state uniquement la ou il y a un etat null/vide temporaire visible
4. Si l'ecran a deja un early return avec un message vide, le remplacer par `<ScreenLoading />`
5. `npx tsc --noEmit` → 0 erreur
6. `npm test` → 0 fail

## Contraintes
- NE PAS modifier les ecrans deja touches par les taches C/I (React.memo)
- NE PAS ajouter de loading sur les ecrans ou les donnees arrivent instantanement via withObservables
- NE PAS modifier ScreenLoader.tsx (c'est le fallback Suspense, different)
- Le composant doit etre leger (pas de skeleton loader complexe, juste ActivityIndicator)

## Criteres de validation
- `npx tsc --noEmit` → 0 erreur
- `npm test` → 2231+ passed
- ScreenLoading composant cree et fonctionnel
- Loading states ajoutes uniquement la ou c'est pertinent

## Dependances
Aucune — independant.

## Statut
⏳ En attente
