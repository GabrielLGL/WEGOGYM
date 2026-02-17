import React, { useEffect } from 'react';
import AppNavigator from './src/navigation';
import { seedExercises } from './src/model/seed';

export default function App() {
  useEffect(() => {
    // Charge les exercices de base au démarrage si la DB est vide
    seedExercises();
  }, []);

  return (
    <AppNavigator />
  );
}