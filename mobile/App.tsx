import React, { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import AppNavigator from './src/navigation';
import AnimatedSplash from './src/components/AnimatedSplash';
import { seedExercises } from './src/model/seed';
import { seedDevData } from './src/model/seedDevData';
import { seedExerciseDescriptions } from './src/model/utils/exerciseDescriptions';
import { database } from './src/model/index';
import { initSentry } from './src/services/sentry';

// Initialiser Sentry dès le démarrage de l'app
initSentry();

// Retenir le splash natif jusqu'à ce que l'app soit prête
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const [appReady, setAppReady] = useState(false);
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    seedExercises().then(() => {
      seedExerciseDescriptions(database);
      if (__DEV__) seedDevData();
    }).finally(() => setAppReady(true));
  }, []);

  // Quand l'app est prête, cacher le splash natif et laisser l'animé prendre le relai
  useEffect(() => {
    if (appReady) {
      SplashScreen.hideAsync();
    }
  }, [appReady]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {splashDone ? (
        <AppNavigator />
      ) : (
        <AnimatedSplash appReady={appReady} onFinish={() => setSplashDone(true)} />
      )}
    </GestureHandlerRootView>
  );
}