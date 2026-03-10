# Passe 6/8 — Code mort & qualité

## Issues trouvées : 5

### 🟡 Q1 — Hardcoded Colors AnimatedSplash
**Fichier :** `components/AnimatedSplash.tsx:20-21`
**Doublon avec C-R W1**

### 🟡 Q2 — Unused catch parameter
**Fichier :** `hooks/useCoachMarks.ts:23`
**Description :** Variable `e` dans catch utilisée dans console.error — faux positif

### 🟡 Q3 — Type assertion notificationService
**Fichier :** `services/notificationService.ts:136`
**Description :** `as Record<string, unknown>` — pourrait utiliser optional chaining
**Fix :** Mineur, le code fonctionne correctement

### 🔵 Q4 — Pattern console.warn guards
**Description :** Tous les guards __DEV__ sont en place — RAS

### 🔵 Q5 — _raw access secureKeyStore
**Fichier :** `services/secureKeyStore.ts:81`
**Description :** Accès _raw pour migration — intentionnel et unique

## Bilan qualité
- ✅ Aucun `any` trouvé
- ✅ Aucun console.log/warn non gardé
- ✅ Aucune couleur hardcodée (sauf splash intentionnel)
- ✅ Pas de code mort significatif
- ✅ Conventions de nommage cohérentes
