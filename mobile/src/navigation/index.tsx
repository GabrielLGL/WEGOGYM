import React, { useEffect, useRef, useState } from 'react'
import { NavigationContainer, DarkTheme, NavigationContainerRefWithCurrent } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Platform, BackHandler, ToastAndroid } from 'react-native'
import { useNavigationContainerRef } from '@react-navigation/native'
import { PortalProvider } from '@gorhom/portal'
import { colors } from '../theme'
import { useHaptics } from '../hooks/useHaptics'

import HomeScreen from '../screens/HomeScreen'
import ProgramsScreen from '../screens/ProgramsScreen'
import SessionDetailScreen from '../screens/SessionDetailScreen'
import ExercisesScreen from '../screens/ExercisesScreen'
import ChartsScreen from '../screens/ChartsScreen'
import SettingsScreen from '../screens/SettingsScreen'
import WorkoutScreen from '../screens/WorkoutScreen'
import AssistantScreen from '../screens/AssistantScreen'
import StatsScreen from '../screens/StatsScreen'
import StatsDurationScreen from '../screens/StatsDurationScreen'
import StatsVolumeScreen from '../screens/StatsVolumeScreen'
import StatsCalendarScreen from '../screens/StatsCalendarScreen'
import StatsRepartitionScreen from '../screens/StatsRepartitionScreen'
import StatsExercisesScreen from '../screens/StatsExercisesScreen'
import StatsMeasurementsScreen from '../screens/StatsMeasurementsScreen'
import { ErrorBoundary } from '../components/ErrorBoundary'
import OnboardingScreen from '../screens/OnboardingScreen'
import { database } from '../model'
import User from '../model/models/User'

export type RootStackParamList = {
  Onboarding: undefined;
  Home: undefined;
  Programs: undefined;
  Exercices: undefined;
  Assistant: undefined;
  Stats: undefined;
  SessionDetail: { sessionId: string };
  Settings: undefined;
  Workout: { sessionId: string };
  StatsDuration: undefined;
  StatsVolume: undefined;
  StatsCalendar: undefined;
  StatsRepartition: undefined;
  StatsExercises: undefined;
  StatsMeasurements: undefined;
  StatsHistory: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>()

const MyDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.background,
    card: colors.card,
    text: colors.text,
    border: colors.cardSecondary,
    primary: colors.primary,
  },
};

/**
 * Composant responsable de gérer le bouton retour matériel sur Android.
 * Il assure que l'utilisateur repasse par l'accueil avant de quitter.
 */
function GlobalBackHandler({ navigationRef }: { navigationRef: NavigationContainerRefWithCurrent<RootStackParamList> }) {
  const backPressRef = useRef(0);
  const resetTimerRef = useRef<NodeJS.Timeout | null>(null);
  const haptics = useHaptics();

  useEffect(() => {
    const backAction = () => {
      const nav = navigationRef.current;
      if (!nav) return false;

      const currentRoute = nav.getCurrentRoute();
      if (!currentRoute) return false;

      const isHome = (currentRoute.name as string) === 'Home';

      if (isHome) {
        if (backPressRef.current === 0) {
          backPressRef.current = 1;
          haptics.onPress();
          if (Platform.OS === 'android') {
            ToastAndroid.show("Appuyez à nouveau pour quitter", ToastAndroid.SHORT);
          }
          resetTimerRef.current = setTimeout(() => { backPressRef.current = 0; }, 2000);
          return true;
        } else {
          BackHandler.exitApp();
          return true;
        }
      } else {
        haptics.onSelect();
        nav.navigate('Home');
        return true;
      }
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => {
      backHandler.remove();
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, [navigationRef]);

  return null;
}

/**
 * Navigateur Racine de l'application.
 * Stack-only : le HomeScreen (dashboard) sert de hub de navigation.
 */
export default function AppNavigator() {
  const navigationRef = useNavigationContainerRef<RootStackParamList>();
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList | null>(null)

  useEffect(() => {
    database.get<User>('users').query().fetch().then(users => {
      const user = users[0]
      setInitialRoute(!user || !user.onboardingCompleted ? 'Onboarding' : 'Home')
    })
  }, [])

  if (initialRoute === null) {
    return null
  }

  return (
    <ErrorBoundary>
      <PortalProvider>
        <NavigationContainer ref={navigationRef} theme={MyDarkTheme}>
          <GlobalBackHandler navigationRef={navigationRef} />
          <Stack.Navigator
            initialRouteName={initialRoute}
            screenOptions={{
              headerStyle: { backgroundColor: colors.background },
              headerTintColor: colors.text,
              headerShadowVisible: false,
              contentStyle: { backgroundColor: colors.background },
              statusBarStyle: 'light',
              statusBarBackgroundColor: colors.background,
            }}
          >
            {/* Onboarding */}
            <Stack.Screen
              name="Onboarding"
              component={OnboardingScreen}
              options={{ headerShown: false }}
            />
            {/* Dashboard principal */}
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ headerShown: false }}
            />
            {/* Écrans principaux (ex-onglets) */}
            <Stack.Screen name="Programs" component={ProgramsScreen} options={{ title: 'Programmes' }} />
            <Stack.Screen name="Exercices" component={ExercisesScreen} options={{ title: 'Bibliothèque' }} />
            <Stack.Screen name="Assistant" component={AssistantScreen} options={{ title: 'Assistant IA' }} />
            <Stack.Screen name="Stats" component={StatsScreen} options={{ title: 'Statistiques' }} />
            {/* Écrans de détail */}
            <Stack.Screen name="SessionDetail" component={SessionDetailScreen} options={{ title: 'Gestion de la séance' }} />
            <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Paramètres' }} />
            <Stack.Screen name="Workout" component={WorkoutScreen} options={{ title: '' }} />
            <Stack.Screen name="StatsDuration" component={StatsDurationScreen} options={{ title: 'Durée des séances' }} />
            <Stack.Screen name="StatsVolume" component={StatsVolumeScreen} options={{ title: "Volume d'entraînement" }} />
            <Stack.Screen name="StatsCalendar" component={StatsCalendarScreen} options={{ title: "Calendrier d'activité" }} />
            <Stack.Screen name="StatsRepartition" component={StatsRepartitionScreen} options={{ title: 'Répartition musculaire' }} />
            <Stack.Screen name="StatsExercises" component={StatsExercisesScreen} options={{ title: 'Exercices & Records' }} />
            <Stack.Screen name="StatsMeasurements" component={StatsMeasurementsScreen} options={{ title: 'Mesures corporelles' }} />
            <Stack.Screen name="StatsHistory" component={ChartsScreen} options={{ title: 'Historique' }} />
          </Stack.Navigator>
        </NavigationContainer>
      </PortalProvider>
    </ErrorBoundary>
  )
}
