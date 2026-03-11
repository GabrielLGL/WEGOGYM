import React from 'react'
import { FlexWidget, TextWidget } from 'react-native-android-widget'

// Couleurs Kore — valeurs hex directes (pas d'import theme/index.ts dans le widget)
const COLOR_BG = '#1C1C1E'
const COLOR_PRIMARY = '#FF6B35'
const COLOR_TEXT = '#FFFFFF'
const COLOR_TEXT_SECONDARY = '#8E8E93'
const COLOR_SEPARATOR = '#2C2C2E'

export interface KoreWidgetProps {
  streak: number
  streakTarget: number
  level: number
  nextWorkoutName: string | null
  nextWorkoutExerciseCount: number
}

export function KoreWidget({
  streak,
  streakTarget,
  level,
  nextWorkoutName,
  nextWorkoutExerciseCount,
}: KoreWidgetProps) {
  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLOR_BG,
        borderRadius: 16,
        padding: 16,
      }}
    >
      {/* ── Section gauche — Streak ── */}
      <FlexWidget
        style={{
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
        }}
      >
        <TextWidget
          text="🔥 Streak"
          style={{
            fontSize: 12,
            color: COLOR_TEXT_SECONDARY,
          }}
        />
        <TextWidget
          text={`${streak} sem.`}
          style={{
            fontSize: 22,
            fontWeight: '700',
            color: COLOR_PRIMARY,
          }}
        />
        <TextWidget
          text={`●●●${'○'.repeat(Math.max(0, streakTarget - Math.min(streak, streakTarget)))}`}
          style={{
            fontSize: 10,
            color: COLOR_PRIMARY,
          }}
        />
        <TextWidget
          text={`Niv. ${level}`}
          style={{
            fontSize: 11,
            color: COLOR_TEXT_SECONDARY,
          }}
        />
      </FlexWidget>

      {/* ── Séparateur ── */}
      <FlexWidget
        style={{
          width: 1,
          height: 'match_parent',
          backgroundColor: COLOR_SEPARATOR,
          marginHorizontal: 12,
        }}
      />

      {/* ── Section droite — Prochain workout ── */}
      <FlexWidget
        style={{
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
        }}
      >
        <TextWidget
          text="💪 Prochain"
          style={{
            fontSize: 12,
            color: COLOR_TEXT_SECONDARY,
          }}
        />
        {nextWorkoutName !== null ? (
          <>
            <TextWidget
              text={nextWorkoutName}
              style={{
                fontSize: 15,
                fontWeight: '700',
                color: COLOR_TEXT,
              }}
            />
            <TextWidget
              text={`${nextWorkoutExerciseCount} exercices`}
              style={{
                fontSize: 11,
                color: COLOR_TEXT_SECONDARY,
              }}
            />
            <TextWidget
              text="Commencer →"
              style={{
                fontSize: 11,
                fontWeight: '600',
                color: COLOR_PRIMARY,
              }}
            />
          </>
        ) : (
          <TextWidget
            text="Aucun programme actif"
            style={{
              fontSize: 12,
              color: COLOR_TEXT_SECONDARY,
            }}
          />
        )}
      </FlexWidget>
    </FlexWidget>
  )
}
