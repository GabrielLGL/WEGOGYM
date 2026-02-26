# Passe 4 — Bugs silencieux — 20260226-1242

## Méthode
Scan de tous les .ts/.tsx dans mobile/src/ + vérification manuelle des alertes.

---

## Alertes vérifiées — FAUX POSITIFS

### FP1 — WorkoutScreen.tsx:242 — getTotalSessionCount
**Alerte initiale :** "Fonction non définie"
**Vérification :** Définie en ligne 332 comme fonction locale async. ✅ Faux positif.

### FP2 — geminiProvider.ts — return throwGeminiError(response)
**Alerte initiale :** "Promise throw non catchée"
**Vérification :** `throwGeminiError` retourne `Promise<never>` (always rejects).
`return throwGeminiError(response)` dans une fonction async forward correctement la rejection.
Le caller await la fonction et reçoit l'erreur. ✅ Faux positif.

### FP3 — RestTimer.tsx:35-37 — setState après unmount
**Alerte initiale :** "Accès à state potentiellement après unmount"
**Vérification :** `notificationIdRef.current = id` accède à une **ref**, pas à du state.
Les refs ne causent pas de re-render et sont sûrs après unmount. ✅ Faux positif.

### FP4 — BottomSheet.tsx — BackHandler non nettoyé
**Alerte initiale :** "Event listener leak"
**Vérification :** `visible` est dans les dépendances useEffect, cleanup correct. ✅ Faux positif.

### FP5 — openaiProvider.ts — retry race condition
**Alerte initiale :** "Race condition retry sans gestion d'erreur"
**Vérification :** Le retry est dans un try/finally avec withTimeout (clear() en finally). ✅ Faux positif.

---

## Bugs confirmés

Aucun bug silencieux réel trouvé lors de ce run.

---

## Verdict
**20/20 — 0 bug silencieux réel, 5 faux positifs clarifiés.**

Patterns conformes aux règles CLAUDE.md (section 3.1) :
- ✅ Toutes les mutations WDB dans database.write()
- ✅ Tous les setTimeout/setInterval avec cleanup
- ✅ Toutes les subscriptions avec unsubscribe
- ✅ Null safety respectée
