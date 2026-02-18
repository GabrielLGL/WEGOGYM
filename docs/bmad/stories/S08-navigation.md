# S08 — Ajout onglet Assistant dans la navigation
> Priorité : Must | Dépend de : S06 | Bloque : —

## Objectif
Intégrer l'écran Assistant dans la bottom nav bar.

## Tâches techniques
Modifier `navigation/index.tsx` :

1. Importer `AssistantScreen`
2. Ajouter entre "Home" et "Stats" :
```tsx
<Tab.Screen
  name="Assistant"
  component={AssistantScreen}
  options={{
    headerTitle: "Assistant IA",
    tabBarLabel: 'Assistant',
    tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>✨</Text>
  }}
/>
```

## Critères d'acceptation
- [ ] Onglet "Assistant" visible dans la nav bar entre Home et Stats
- [ ] Navigation vers l'écran fonctionne
- [ ] Bouton retour Android redirige vers Home (comportement `GlobalBackHandler` existant)
- [ ] Tab bar se masque correctement lors de l'ouverture du BottomSheet
