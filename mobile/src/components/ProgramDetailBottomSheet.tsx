import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native'
import withObservables from '@nozbe/with-observables'
import { Q } from '@nozbe/watermelondb'
import { of } from 'rxjs'
import { catchError } from 'rxjs/operators'
import { database } from '../model/index'
import { BottomSheet } from './BottomSheet'
import Program from '../model/models/Program'
import Session from '../model/models/Session'
import Exercise from '../model/models/Exercise'
import { useHaptics } from '../hooks/useHaptics'
import { useLanguage } from '../contexts/LanguageContext'
import { spacing, borderRadius, fontSize } from '../theme'
import { useColors } from '../contexts/ThemeContext'
import type { ThemeColors } from '../theme'

const { height: screenHeight } = Dimensions.get('window')

// --- SessionPreviewRow ---

interface SessionPreviewRowInnerProps {
  session: Session
  exercises: Exercise[]
  onPress: () => void
  onOptionsPress: () => void
}

const SessionPreviewRowInner: React.FC<SessionPreviewRowInnerProps> = ({
  session,
  exercises,
  onPress,
  onOptionsPress,
}) => {
  const colors = useColors()
  const rowStyles = useRowStyles(colors)
  const haptics = useHaptics()

  const exercisePreview =
    exercises.length > 0
      ? exercises.slice(0, 3).map(e => e.name).join(', ') + (exercises.length > 3 ? '...' : '')
      : 'Aucun exercice'

  return (
    <View style={rowStyles.container}>
      <TouchableOpacity
        style={rowStyles.clickable}
        onPress={() => { haptics.onPress(); onPress() }}
        activeOpacity={0.7}
      >
        <Text style={rowStyles.sessionName}>{session.name}</Text>
        <Text style={rowStyles.exercisePreview} numberOfLines={1}>{exercisePreview}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={rowStyles.optionsBtn}
        onPress={() => { haptics.onPress(); onOptionsPress() }}
      >
        <Text style={rowStyles.moreIcon}>•••</Text>
      </TouchableOpacity>
    </View>
  )
}

const SessionPreviewRow = withObservables(['session'], ({ session }: { session: Session }) => ({
  session: session.observe(),
  exercises: database.get<Exercise>('exercises').query(
    Q.on('session_exercises', 'session_id', session.id)
  ).observe().pipe(
    catchError(err => {
      if (__DEV__) console.error('SessionPreviewRow: exercises error', err)
      return of([] as Exercise[])
    })
  ),
}))(SessionPreviewRowInner)

// --- ProgramDetailContent ---

interface ProgramDetailContentInnerProps {
  program: Program
  sessions: Session[]
  onOpenSession: (session: Session) => void
  onAddSession: () => void
  onSessionOptions: (session: Session) => void
}

const ProgramDetailContentInner: React.FC<ProgramDetailContentInnerProps> = ({
  sessions,
  onOpenSession,
  onAddSession,
  onSessionOptions,
}) => {
  const colors = useColors()
  const contentStyles = useContentStyles(colors)
  const { t } = useLanguage()

  return (
    <>
      <ScrollView style={{ maxHeight: screenHeight * 0.55 }} showsVerticalScrollIndicator={false}>
        {sessions.length === 0 ? (
          <Text style={contentStyles.emptyText}>
            {t.programDetail.noSessions}
          </Text>
        ) : (
          sessions.map(session => (
            <SessionPreviewRow
              key={session.id}
              session={session}
              onPress={() => onOpenSession(session)}
              onOptionsPress={() => onSessionOptions(session)}
            />
          ))
        )}
      </ScrollView>
      <TouchableOpacity style={contentStyles.addButton} onPress={onAddSession}>
        <Text style={contentStyles.addButtonText}>{t.programDetail.addSession}</Text>
      </TouchableOpacity>
    </>
  )
}

const ProgramDetailContent = withObservables(
  ['program'],
  ({ program }: { program: Program }) => ({
    program: program.observe(),
    sessions: database.get<Session>('sessions').query(
      Q.where('program_id', program.id),
      Q.sortBy('position', Q.asc)
    ).observe().pipe(
      catchError(err => {
        if (__DEV__) console.error('ProgramDetailContent: sessions error', err)
        return of([] as Session[])
      })
    ),
  })
)(ProgramDetailContentInner)

// --- ProgramDetailBottomSheet (export principal) ---

interface ProgramDetailBottomSheetProps {
  program: Program | null
  visible: boolean
  onClose: () => void
  onOpenSession: (session: Session) => void
  onAddSession: () => void
  onSessionOptions: (session: Session) => void
}

const ProgramDetailBottomSheet: React.FC<ProgramDetailBottomSheetProps> = ({
  program,
  visible,
  onClose,
  onOpenSession,
  onAddSession,
  onSessionOptions,
}) => {
  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={program?.name}
    >
      {program ? (
        <ProgramDetailContent
          program={program}
          onOpenSession={onOpenSession}
          onAddSession={onAddSession}
          onSessionOptions={onSessionOptions}
        />
      ) : null}
    </BottomSheet>
  )
}

export default ProgramDetailBottomSheet
export { SessionPreviewRow }

// --- Styles ---

function useRowStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.cardSecondary,
      borderRadius: borderRadius.sm,
      marginBottom: spacing.sm,
    },
    clickable: {
      flex: 1,
      padding: spacing.md,
    },
    sessionName: {
      fontSize: fontSize.md,
      fontWeight: 'bold',
      color: colors.text,
    },
    exercisePreview: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
      marginTop: spacing.xs,
    },
    optionsBtn: {
      padding: spacing.md,
    },
    moreIcon: {
      color: colors.textSecondary,
      fontSize: fontSize.sm,
      fontWeight: 'bold',
    },
  })
}

function useContentStyles(colors: ThemeColors) {
  return StyleSheet.create({
    emptyText: {
      color: colors.textSecondary,
      fontSize: fontSize.sm,
      textAlign: 'center',
      paddingVertical: spacing.lg,
    },
    addButton: {
      marginTop: spacing.sm,
      padding: spacing.md,
      backgroundColor: colors.cardSecondary,
      borderWidth: 1,
      borderColor: colors.border,
      borderStyle: 'dashed',
      borderRadius: borderRadius.md,
      alignItems: 'center',
    },
    addButtonText: {
      color: colors.primary,
      fontWeight: 'bold',
      fontSize: fontSize.sm,
    },
  })
}
