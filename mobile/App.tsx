import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigator from './src/navigation';
import { seedExercises } from './src/model/seed';
import { seedDevData } from './src/model/seedDevData';
import { initSentry } from './src/services/sentry';
import { migrateKeyFromDB } from './src/services/secureKeyStore';

// Initialiser Sentry dès le démarrage de l'app
initSentry();

export default function App() {
  useEffect(() => {
    // Charge les exercices de base au démarrage si la DB est vide
    seedExercises().then(() => {
      if (__DEV__) seedDevData();
    });
    // Migrate API key from SQLite to secure storage (one-time)
    migrateKeyFromDB();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppNavigator />
    </GestureHandlerRootView>
  );
}