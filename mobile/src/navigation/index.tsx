// Importation de React et des hooks nécessaires
import React, { useState, useEffect, useRef } from 'react'
// Importation des outils de navigation de React Navigation
import { NavigationContainer, DarkTheme } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
// Importation des composants et utilitaires React Native
import { View, Text, Keyboard, Animated, Platform, BackHandler, ToastAndroid, DeviceEventEmitter, TouchableOpacity } from 'react-native'
import { useNavigationContainerRef } from '@react-navigation/native'
// Importation de la bibliothèque pour les vibrations
import * as Haptics from 'expo-haptics'
// --- AJOUT : Import du Provider pour les Modals ---
import { PortalProvider } from '@gorhom/portal'
import { colors } from '../theme'

// Importation des écrans de l'application
import HomeScreen from '../screens/HomeScreen'
import SessionDetailScreen from '../screens/SessionDetailScreen'
import ExercisesScreen from '../screens/ExercisesScreen'
import ChartsScreen from '../screens/ChartsScreen'
import SettingsScreen from '../screens/SettingsScreen'
import WorkoutScreen from '../screens/WorkoutScreen'
// Importation de l'ErrorBoundary
import { ErrorBoundary } from '../components/ErrorBoundary'

// Définition des types pour les paramètres de navigation (TypeScript)
export type RootStackParamList = {
  MainTabs: { screen?: string } | undefined;
  SessionDetail: { sessionId: string };
  Settings: undefined;
  Workout: { sessionId: string };
};

// Création des navigateurs Stack (empilement) et Tab (onglets du bas)
const Stack = createNativeStackNavigator<RootStackParamList>()
const Tab = createBottomTabNavigator()

// Configuration du thème sombre personnalisé pour l'application
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
function GlobalBackHandler({ navigationRef }: { navigationRef: any }) {
  const backPressRef = useRef(0); // Compteur pour le double clic pour quitter
  const resetTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const backAction = () => {
      const nav = navigationRef.current;
      if (!nav) return false;

      const currentRoute = nav.getCurrentRoute();
      if (!currentRoute) return false;

      // On vérifie si l'utilisateur est sur l'onglet 'Home' (Prog)
      const isHome = currentRoute.name === 'Home';

      if (isHome) {
        // DÉJÀ SUR ACCUEIL -> Logique de double clic pour quitter l'application
        if (backPressRef.current === 0) {
          backPressRef.current = 1;
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); // Petite vibration
          if (Platform.OS === 'android') {
            ToastAndroid.show("Appuyez à nouveau pour quitter", ToastAndroid.SHORT);
          }
          // Réinitialise le compteur après 2 secondes
          resetTimerRef.current = setTimeout(() => { backPressRef.current = 0; }, 2000);
          return true;
        } else {
          // Deuxième clic : on quitte réellement
          BackHandler.exitApp();
          return true;
        }
      } else {
        // N'IMPORTE OÙ AILLEURS -> Retour forcé à l'accueil (Prog)
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        // On s'assure que la Tab Bar réapparaît si elle était masquée par un clavier ou une modale
        DeviceEventEmitter.emit('SHOW_TAB_BAR');
        // Navigation vers l'onglet Home
        nav.navigate('MainTabs', { screen: 'Home' });
        return true;
      }
    };

    // Ajout de l'écouteur d'événement système
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => {
      backHandler.remove(); // Nettoyage lors du démontage
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, [navigationRef]);

  return null; // Ce composant n'affiche rien visuellement
}

/**
 * Navigateur par onglets situé en bas de l'écran.
 */
function TabNavigator({ navigation }: any) {
  // Référence pour l'animation de glissement de la barre d'onglets
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Écouteurs pour masquer la barre quand le clavier s'ouvre
    const showSub = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', () => Animated.timing(scrollY, { toValue: 100, duration: 250, useNativeDriver: true }).start());
    const hideSub = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () => Animated.timing(scrollY, { toValue: 0, duration: 250, useNativeDriver: true }).start());

    // Écouteurs pour masquer la barre manuellement lors de l'ouverture de modales (overlays)
    const hideTab = DeviceEventEmitter.addListener('HIDE_TAB_BAR', () => { Animated.timing(scrollY, { toValue: 100, duration: 250, useNativeDriver: true }).start(); });
    const showTab = DeviceEventEmitter.addListener('SHOW_TAB_BAR', () => { Animated.timing(scrollY, { toValue: 0, duration: 250, useNativeDriver: true }).start(); });

    return () => {
      showSub.remove(); hideSub.remove();
      hideTab.remove(); showTab.remove();
    };
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Tab.Navigator
        initialRouteName="Home"
        backBehavior="none" // On désactive le retour par défaut pour utiliser notre GlobalBackHandler
        screenOptions={{
          headerShown: true, // Affiche le header natif
          headerStyle: { backgroundColor: colors.background, elevation: 0, shadowOpacity: 0, borderBottomWidth: 0 },
          headerTitleAlign: 'left', // Aligne le titre à gauche
          headerTitleStyle: { fontSize: 22, fontWeight: 'bold', color: colors.text },
          tabBarStyle: {
            backgroundColor: colors.card,
            borderTopWidth: 0,
            height: 60,
            paddingBottom: 10,
            position: 'absolute', // Permet l'animation de glissement
            bottom: 0, left: 0, right: 0,
            transform: [{ translateY: scrollY }] // Applique l'animation
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
        }}
      >
        {/* Onglet Bibliothèque d'exercices */}
        <Tab.Screen
          name="Exercices"
          component={ExercisesScreen}
          options={{ headerTitle: "Bibliothèque", tabBarLabel: 'Bibliothèque', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🏋️</Text> }}
        />
        {/* Onglet Principal (Programmes) */}
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={({ navigation: nav }) => ({
            headerTitle: "Liste des programmes :",
            tabBarLabel: 'Prog',
            tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🏠</Text>,
            // Ajout de la roue crantée uniquement sur cet onglet
            headerRight: () => (
              <TouchableOpacity style={{ marginRight: 20, padding: 5 }} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); nav.getParent()?.navigate('Settings'); }}>
                <Text style={{ fontSize: 24 }}>⚙️</Text>
              </TouchableOpacity>
            ),
          })}
        />
        {/* Onglet Statistiques */}
        <Tab.Screen
          name="Stats"
          component={ChartsScreen}
          options={{ headerTitle: "Statistiques", tabBarLabel: 'Stats', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📈</Text> }}
        />
      </Tab.Navigator>
    </View>
  )
}

/**
 * Navigateur Racine de l'application.
 * Contient les onglets et les écrans de détail profonds.
 */
export default function AppNavigator() {
  const navigationRef = useNavigationContainerRef(); // Référence globale pour le GlobalBackHandler

  return (
    // --- ERROR BOUNDARY : Capture les erreurs non gérées pour éviter l'écran blanc ---
    <ErrorBoundary>
      {/* --- WRAPPER PORTAL : C'est ici que les modales seront injectées --- */}
      <PortalProvider>
        <NavigationContainer ref={navigationRef} theme={MyDarkTheme}>
          <GlobalBackHandler navigationRef={navigationRef} />
          <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: colors.background }, headerTintColor: colors.text, contentStyle: { backgroundColor: colors.background } }}>
            {/* L'écran principal contient les onglets */}
            <Stack.Screen name="MainTabs" component={TabNavigator} options={{ headerShown: false }} />
            {/* Écrans de détail (sans onglets en bas) */}
            <Stack.Screen name="SessionDetail" component={SessionDetailScreen} options={{ title: 'Gestion de la séance' }} />
            <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Paramètres' }} />
            <Stack.Screen name="Workout" component={WorkoutScreen} options={{ title: '' }} />
          </Stack.Navigator>
        </NavigationContainer>
      </PortalProvider>
    </ErrorBoundary>
  )
}