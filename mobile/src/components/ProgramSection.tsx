import React, { useMemo } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import withObservables from '@nozbe/with-observables'
import { Q } from '@nozbe/watermelondb'
import { database } from '../model/index'
import Program from '../model/models/Program'
import Session from '../model/models/Session'
import { spacing, borderRadius, fontSize } from '../theme'
import { useTheme } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import type { ThemeColors } from '../theme'

interface Props {
  program: Program
  sessions: Session[] // injectée par withObservables
  onPress: () => void // tap → ouvre la bottom sheet de détail
  onLongPressProgram: () => void // long press → drag & drop
  onOptionsPress: () => void // bouton ••• → options du programme
}

const ProgramSection: React.FC<Props> = ({
  program,
  sessions,
  onPress,
  onLongPressProgram,
  onOptionsPress,
}) => {
  const { colors, neuShadow } = useTheme()
  const styles = useStyles(colors)
  const { t } = useLanguage()
  const sessionCount = sessions.length
  const sessionLabel = sessionCount === 0
    ? t.home.noSessions
    : `${sessionCount} ${sessionCount > 1 ? t.home.sessions : t.home.session}`

  return (
    <View style={[styles.container, neuShadow.elevated]}>
      <View style={styles.row}>
        <TouchableOpacity
          style={styles.pressable}
          onPress={onPress}
          onLongPress={onLongPressProgram}
          delayLongPress={500}
          activeOpacity={0.7}
        >
          <Text style={styles.title}>{program.name}</Text>
          <Text style={styles.subtitle}>{sessionLabel}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionsBtn} onPress={onOptionsPress}>
          <Text style={styles.moreIcon}>•••</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

function useStyles(colors: ThemeColors) {
  return useMemo(() => StyleSheet.create({
    container: {
      marginBottom: spacing.md,
      backgroundColor: colors.card,
      borderRadius: borderRadius.md,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.sm,
      paddingLeft: spacing.md,
    },
    pressable: {
      flex: 1,
      paddingVertical: spacing.sm,
    },
    title: {
      fontSize: fontSize.lg,
      fontWeight: 'bold',
      color: colors.text,
    },
    subtitle: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
      marginTop: spacing.xs,
    },
    optionsBtn: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
    },
    moreIcon: {
      color: colors.textSecondary,
      fontSize: fontSize.lg,
      fontWeight: 'bold',
      letterSpacing: 1,
    },
  }), [colors])
}

export default withObservables(['program'], ({ program }: { program: Program }) => ({
  program: program.observe(),
  sessions: database.get<Session>('sessions').query(
    Q.where('program_id', program.id),
    Q.sortBy('position', Q.asc)
  ).observe()
}))(ProgramSection)
