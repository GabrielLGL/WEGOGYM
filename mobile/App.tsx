import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigator from './src/navigation';
import { seedExercises } from './src/model/seed';
import { initSentry } from './src/services/sentry';

// Initialiser Sentry dès le démarrage de l'app
initSentry();

export default function App() {
  useEffect(() => {
    // Charge les exercices de base au démarrage si la DB est vide
    seedExercises();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppNavigator />
    </GestureHandlerRootView>
  );
}