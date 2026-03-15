/**
 * navigation/index.tsx — Configuration de la navigation et providers racine
 *
 * Architecture :
 * - PortalProvider (pour AlertDialog/BottomSheet sans Modal natif)
 * - ThemeProvider (dark/light mode, persisté dans users.theme_mode)
 * - LanguageProvider (FR/EN, persisté dans users.language_mode)
 * - NavigationContainer + Native Stack Navigator
 *
 * Écrans chargés en lazy (React.lazy + Suspense) sauf HomeScreen et OnboardingScreen
 * qui sont critiques au démarrage.
 *
 * Flow initial :
 * 1. Lecture du User en DB (ou création si premier lancement)
 * 2. Vérification acceptation CGU (version) → Onboarding si nécessaire
 * 3. Navigation vers Home avec les providers initialisés
 */

import React, { Suspense, useEffect, useRef, useState } from 'react'
import { NavigationContainer, DarkTheme, NavigationContainerRefWithCurrent } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Platform, BackHandler, ToastAndroid } from 'react-native'
import { useNavigationContainerRef } from '@react-navigation/native'
import { PortalProvider } from '@gorhom/portal'
import { useHaptics } from '../hooks/useHaptics'
import { ThemeProvider, useTheme } from '../contexts/ThemeContext'
import { LanguageProvider, useLanguage } from '../contexts/LanguageContext'
import type { ThemeMode } from '../theme'
import type { Language } from '../i18n'

// Static imports — critical startup screens
import HomeScreen from '../screens/HomeScreen'
import OnboardingScreen from '../screens/OnboardingScreen'

import { ErrorBoundary } from '../components/ErrorBoundary'
import ScreenLoader from '../components/ScreenLoader'
import { database } from '../model'
import User from '../model/models/User'
import { fetchCurrentUser } from '../model/utils/databaseHelpers'
import { CGU_VERSION } from '../model/constants'
import { updateReminders } from '../services/notificationService'
import type { MilestoneEvent } from '../model/utils/gamificationHelpers'
import type { BadgeDefinition } from '../model/utils/badgeConstants'
import type { GeneratedPlan } from '../services/ai/types'

// Lazy imports — secondary screens
const ProgramsScreen = React.lazy(() => import('../screens/ProgramsScreen'))
const SessionDetailScreen = React.lazy(() => import('../screens/SessionDetailScreen'))
const ExercisesScreen = React.lazy(() => import('../screens/ExercisesScreen'))
const ChartsScreen = React.lazy(() => import('../screens/ChartsScreen'))
const SettingsScreen = React.lazy(() => import('../screens/SettingsScreen'))
const WorkoutScreen = React.lazy(() => import('../screens/WorkoutScreen'))
const AssistantScreen = React.lazy(() => import('../screens/AssistantScreen'))
const StatsScreen = React.lazy(() => import('../screens/StatsScreen'))
const StatsDurationScreen = React.lazy(() => import('../screens/StatsDurationScreen'))
const StatsVolumeScreen = React.lazy(() => import('../screens/StatsVolumeScreen'))
const StatsCalendarScreen = React.lazy(() => import('../screens/StatsCalendarScreen'))
const StatsExercisesScreen = React.lazy(() => import('../screens/StatsExercisesScreen'))
const StatsMeasurementsScreen = React.lazy(() => import('../screens/StatsMeasurementsScreen'))
const BadgesScreen = React.lazy(() => import('../screens/BadgesScreen'))
const ProgramDetailScreen = React.lazy(() => import('../screens/ProgramDetailScreen'))
const ExerciseHistoryScreen = React.lazy(() => import('../screens/ExerciseHistoryScreen'))
const AssistantPreviewScreen = React.lazy(() => import('../screens/AssistantPreviewScreen'))
const CreateExerciseScreen = React.lazy(() => import('../screens/CreateExerciseScreen'))
const ExerciseCatalogScreen = React.lazy(() => import('../screens/ExerciseCatalogScreen'))
const HistoryDetailScreen = React.lazy(() => import('../screens/HistoryDetailScreen'))
const ReportDetailScreen = React.lazy(() => import('../screens/ReportDetailScreen'))
const ProgressPhotosScreen = React.lazy(() => import('../screens/ProgressPhotosScreen'))
const LegalScreen = React.lazy(() => import('../screens/LegalScreen'))
const LeaderboardScreen = React.lazy(() => import('../screens/LeaderboardScreen'))
const SelfLeaguesScreen = React.lazy(() => import('../screens/SelfLeaguesScreen'))
const SkillTreeScreen = React.lazy(() => import('../screens/SkillTreeScreen'))
const StatsHexagonScreen = React.lazy(() => import('../screens/StatsHexagonScreen'))
const ActivityFeedScreen = React.lazy(() => import('../screens/ActivityFeedScreen'))
const StatsHallOfFameScreen = React.lazy(() => import('../screens/StatsHallOfFameScreen'))
const StatsBalanceScreen = React.lazy(() => import('../screens/StatsBalanceScreen'))
const TitlesScreen = React.lazy(() => import('../screens/TitlesScreen'))
const StatsCompareScreen = React.lazy(() => import('../screens/StatsCompareScreen'))
const MonthlyBulletinScreen = React.lazy(() => import('../screens/MonthlyBulletinScreen'))
const StatsConstellationScreen = React.lazy(() => import('../screens/StatsConstellationScreen'))
const ExerciseCollectionScreen = React.lazy(() => import('../screens/ExerciseCollectionScreen'))
const PersonalChallengesScreen = React.lazy(() => import('../screens/PersonalChallengesScreen'))
const ExerciseCardScreen = React.lazy(() => import('../screens/ExerciseCardScreen'))
const StatsHeatmapScreen = React.lazy(() => import('../screens/StatsHeatmapScreen'))
const StatsStrengthScreen = React.lazy(() => import('../screens/StatsStrengthScreen'))
const StatsTrainingSplitScreen = React.lazy(() => import('../screens/StatsTrainingSplitScreen'))
const StatsPRTimelineScreen = React.lazy(() => import('../screens/StatsPRTimelineScreen'))

function isVersionOlder(accepted: string, required: string): boolean {
  const [aMaj, aMin] = accepted.split('.').map(Number)
  const [rMaj, rMin] = required.split('.').map(Number)
  return aMaj < rMaj || (aMaj === rMaj && (aMin ?? 0) < (rMin ?? 0))
}

export type RootStackParamList = {
  Onboarding: { disclaimerOnly?: boolean } | undefined;
  Home: { celebrations?: { milestones: MilestoneEvent[]; badges: BadgeDefinition[] } } | undefined;
  Badges: undefined;
  Programs: undefined;
  Exercices: undefined;
  Assistant: { sessionMode?: { targetProgramId: string } } | undefined;
  Stats: undefined;
  ProgramDetail: { programId: string };
  SessionDetail: { sessionId: string };
  Settings: undefined;
  Workout: { sessionId: string };
  StatsDuration: undefined;
  StatsVolume: undefined;
  StatsCalendar: undefined;
  StatsExercises: undefined;
  StatsMeasurements: undefined;
  StatsHistory: undefined;
  ExerciseHistory: { exerciseId: string };
  AssistantPreview: { plan: GeneratedPlan; mode: 'program' | 'session'; targetProgramId?: string };
  CreateExercise: undefined;
  ExerciseCatalog: undefined;
  HistoryDetail: { historyId: string };
  ReportDetail: { type?: 'weekly' | 'monthly'; offset?: number } | undefined;
  ProgressPhotos: undefined;
  Legal: undefined;
  Leaderboard: undefined;
  SelfLeagues: undefined;
  SkillTree: undefined;
  StatsHexagon: undefined;
  ActivityFeed: undefined;
  StatsHallOfFame: undefined;
  StatsBalance: undefined;
  Titles: undefined;
  StatsCompare: undefined;
  MonthlyBulletin: undefined;
  StatsConstellation: undefined;
  ExerciseCollection: undefined;
  PersonalChallenges: undefined;
  ExerciseCard: { exerciseId: string };
  StatsHeatmap: undefined;
  StatsStrength: undefined;
  StatsTrainingSplit: undefined;
  StatsPRTimeline: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>()

/**
 * Composant responsable de gérer le bouton retour matériel sur Android.
 * Il assure que l'utilisateur repasse par l'accueil avant de quitter.
 */
function GlobalBackHandler({ navigationRef, exitMessage }: { navigationRef: NavigationContainerRefWithCurrent<RootStackParamList>; exitMessage: string }) {
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
            ToastAndroid.show(exitMessage, ToastAndroid.SHORT);
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
  }, [navigationRef, haptics, exitMessage]);

  return null;
}

/**
 * Contenu de l'application — enfant de ThemeProvider pour accéder au thème dynamique.
 * Gère la navigation et le thème de navigation réactif.
 */
function AppContent() {
  const { colors, mode } = useTheme()
  const { t } = useLanguage()
  const navigationRef = useNavigationContainerRef<RootStackParamList>()
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList | null>(null)
  const [initialParams, setInitialParams] = useState<Record<string, unknown> | undefined>(undefined)

  const navTheme = {
    ...DarkTheme,
    dark: mode === 'dark',
    colors: {
      ...DarkTheme.colors,
      background: colors.background,
      card: colors.card,
      text: colors.text,
      border: colors.cardSecondary,
      primary: colors.primary,
    },
  }

  useEffect(() => {
    fetchCurrentUser().then(user => {
      if (!user || !user.onboardingCompleted) {
        setInitialRoute('Onboarding')
      } else if (isVersionOlder(user.cguVersionAccepted ?? '0', CGU_VERSION)) {
        setInitialRoute('Onboarding')
        setInitialParams({ disclaimerOnly: true })
      } else {
        setInitialRoute('Home')
      }
    }).catch(error => {
      if (__DEV__) console.error('[Navigation] DB fetch failed:', error)
      setInitialRoute('Onboarding')
    })
  }, [])

  if (initialRoute === null) return null

  return (
    <NavigationContainer ref={navigationRef} theme={navTheme}>
      <GlobalBackHandler navigationRef={navigationRef} exitMessage={t.common.exitToast} />
      <Suspense fallback={<ScreenLoader />}>
        <Stack.Navigator
          initialRouteName={initialRoute}
          screenOptions={{
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.text,
            headerShadowVisible: false,
            contentStyle: { backgroundColor: colors.background },
            statusBarStyle: mode === 'dark' ? 'light' : 'dark',
            statusBarBackgroundColor: colors.background,
          }}
        >
          {/* Onboarding */}
          <Stack.Screen
            name="Onboarding"
            component={OnboardingScreen}
            options={{ headerShown: false }}
            initialParams={initialRoute === 'Onboarding' ? initialParams as RootStackParamList['Onboarding'] : undefined}
          />
          {/* Dashboard principal */}
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ headerShown: false }}
          />
          {/* Écrans principaux (ex-onglets) */}
          <Stack.Screen name="Programs" component={ProgramsScreen} options={{ title: t.navigation.programs }} />
          <Stack.Screen name="Exercices" component={ExercisesScreen} options={{ title: t.navigation.exercises }} />
          <Stack.Screen name="Assistant" component={AssistantScreen} options={{ title: t.navigation.assistant }} />
          <Stack.Screen name="Stats" component={StatsScreen} options={{ title: t.navigation.stats }} />
          {/* Écrans de détail */}
          <Stack.Screen name="ProgramDetail" component={ProgramDetailScreen} options={{ title: '' }} />
          <Stack.Screen name="SessionDetail" component={SessionDetailScreen} options={{ title: t.navigation.sessionDetail }} />
          <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: t.navigation.settings }} />
          <Stack.Screen name="Workout" component={WorkoutScreen} options={{ title: '' }} />
          <Stack.Screen name="StatsDuration" component={StatsDurationScreen} options={{ title: t.navigation.statsDuration }} />
          <Stack.Screen name="StatsVolume" component={StatsVolumeScreen} options={{ title: t.navigation.statsVolume }} />
          <Stack.Screen name="StatsCalendar" component={StatsCalendarScreen} options={{ title: t.navigation.statsCalendar }} />
          <Stack.Screen name="StatsExercises" component={StatsExercisesScreen} options={{ title: t.navigation.statsExercises }} />
          <Stack.Screen name="StatsMeasurements" component={StatsMeasurementsScreen} options={{ title: t.navigation.statsMeasurements }} />
          <Stack.Screen name="StatsHistory" component={ChartsScreen} options={{ title: t.navigation.statsHistory }} />
          <Stack.Screen name="Badges" component={BadgesScreen} options={{ title: t.navigation.badges }} />
          <Stack.Screen name="ExerciseHistory" component={ExerciseHistoryScreen} options={{ title: '' }} />
          <Stack.Screen name="AssistantPreview" component={AssistantPreviewScreen} options={{ title: t.navigation.assistantPreview }} />
          <Stack.Screen name="CreateExercise" component={CreateExerciseScreen} options={{ title: t.exercises.newTitle }} />
          <Stack.Screen name="ExerciseCatalog" component={ExerciseCatalogScreen} options={{ title: t.navigation.catalogueGlobal }} />
          <Stack.Screen name="HistoryDetail" component={HistoryDetailScreen} options={{ title: '' }} />
          <Stack.Screen name="ReportDetail" component={ReportDetailScreen} options={{ title: t.navigation.reportDetail }} />
          <Stack.Screen name="ProgressPhotos" component={ProgressPhotosScreen} options={{ title: t.navigation.progressPhotos }} />
          <Stack.Screen name="Legal" component={LegalScreen} options={{ title: t.navigation.legal }} />
          <Stack.Screen name="Leaderboard" component={LeaderboardScreen} options={{ title: t.navigation.leaderboard }} />
          <Stack.Screen name="SelfLeagues" component={SelfLeaguesScreen} options={{ title: t.navigation.selfLeagues }} />
          <Stack.Screen name="SkillTree" component={SkillTreeScreen} options={{ title: t.navigation.skillTree }} />
          <Stack.Screen name="StatsHexagon" component={StatsHexagonScreen} options={{ title: t.navigation.statsHexagon }} />
          <Stack.Screen name="ActivityFeed" component={ActivityFeedScreen} options={{ title: t.navigation.activityFeed }} />
          <Stack.Screen name="StatsHallOfFame" component={StatsHallOfFameScreen} options={{ title: t.navigation.hallOfFame }} />
          <Stack.Screen name="StatsBalance" component={StatsBalanceScreen} options={{ title: t.navigation.statsBalance }} />
          <Stack.Screen name="Titles" component={TitlesScreen} options={{ title: t.navigation.titles }} />
          <Stack.Screen name="StatsCompare" component={StatsCompareScreen} options={{ title: t.navigation.statsCompare }} />
          <Stack.Screen name="MonthlyBulletin" component={MonthlyBulletinScreen} options={{ title: t.navigation.monthlyBulletin }} />
          <Stack.Screen name="StatsConstellation" component={StatsConstellationScreen} options={{ title: t.navigation.statsConstellation }} />
          <Stack.Screen name="ExerciseCollection" component={ExerciseCollectionScreen} options={{ title: t.navigation.exerciseCollection }} />
          <Stack.Screen name="PersonalChallenges" component={PersonalChallengesScreen} options={{ title: t.navigation.personalChallenges }} />
          <Stack.Screen name="ExerciseCard" component={ExerciseCardScreen} options={{ title: '' }} />
          <Stack.Screen name="StatsHeatmap" component={StatsHeatmapScreen} options={{ title: t.navigation.statsHeatmap }} />
          <Stack.Screen name="StatsStrength" component={StatsStrengthScreen} options={{ title: t.navigation.statsStrength }} />
          <Stack.Screen name="StatsTrainingSplit" component={StatsTrainingSplitScreen} options={{ title: t.navigation.statsTrainingSplit }} />
          <Stack.Screen name="StatsPRTimeline" component={StatsPRTimelineScreen} options={{ title: t.navigation.statsPRTimeline }} />
        </Stack.Navigator>
      </Suspense>
    </NavigationContainer>
  )
}

/**
 * Navigateur Racine de l'application.
 * Stack-only : le HomeScreen (dashboard) sert de hub de navigation.
 * Charge la préférence de thème au démarrage et fournit le ThemeProvider.
 */
export default function AppNavigator() {
  const [initialMode, setInitialMode] = useState<ThemeMode>('dark')
  const [initialLang, setInitialLang] = useState<Language>('fr')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    fetchCurrentUser().then(user => {
      const savedMode = user?.themeMode
      if (savedMode === 'light' || savedMode === 'dark') {
        setInitialMode(savedMode)
      }
      const savedLang = user?.languageMode
      if (savedLang === 'fr' || savedLang === 'en') {
        setInitialLang(savedLang)
      }
      if (user?.remindersEnabled) {
        let days = [1, 3, 5]
        try { days = user.reminderDays ? JSON.parse(user.reminderDays) : days } catch { /* corrupted data, use default */ }
        updateReminders(true, days, user.reminderHour ?? 18, user.reminderMinute ?? 0)
      }
      setReady(true)
    }).catch(error => {
      if (__DEV__) console.error('[Navigation] DB preferences fetch failed:', error)
      setReady(true)
    })
  }, [])

  if (!ready) return null

  return (
    <ErrorBoundary>
      <LanguageProvider initialLang={initialLang}>
        <ThemeProvider initialMode={initialMode}>
          <PortalProvider>
            <AppContent />
          </PortalProvider>
        </ThemeProvider>
      </LanguageProvider>
    </ErrorBoundary>
  )
}
