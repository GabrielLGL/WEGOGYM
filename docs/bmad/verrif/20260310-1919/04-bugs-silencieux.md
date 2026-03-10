# Passe 4/8 — Bugs Silencieux

**Date :** 2026-03-10 19:19

## Résumé : 0 CRIT, 2 WARN, 1 SUGG

### 🟡 B-1 — ProgramsScreen renameTimerRef sans cleanup unmount
**Fichier :** `screens/ProgramsScreen.tsx:72,296`
Timer 300ms inline sans useEffect cleanup → peut fire après unmount.

### 🟡 B-2 — ProgramDetailScreen renameSessionTimerRef sans cleanup unmount
**Fichier :** `screens/ProgramDetailScreen.tsx:60,192`
Même pattern que B-1.

### 🔵 B-3 — RestTimer styles morts (progressBarWrapper, progressBarFill)
**Fichier :** `components/RestTimer.tsx:208-216`
