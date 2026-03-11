import React from 'react'
import type { WidgetTaskHandlerProps } from 'react-native-android-widget'
import { loadWidgetData } from '../services/widgetDataService'
import { KoreWidget } from './KoreWidget'

export async function widgetTaskHandler(props: WidgetTaskHandlerProps): Promise<void> {
  switch (props.widgetAction) {
    case 'WIDGET_ADDED':
    case 'WIDGET_UPDATE':
    case 'WIDGET_RESIZED': {
      try {
        const data = await loadWidgetData()
        props.renderWidget(
          <KoreWidget
            streak={data?.streak ?? 0}
            streakTarget={data?.streakTarget ?? 3}
            level={data?.level ?? 1}
            nextWorkoutName={data?.nextWorkoutName ?? null}
            nextWorkoutExerciseCount={data?.nextWorkoutExerciseCount ?? 0}
          />
        )
      } catch {
        props.renderWidget(
          <KoreWidget
            streak={0}
            streakTarget={3}
            level={1}
            nextWorkoutName={null}
            nextWorkoutExerciseCount={0}
          />
        )
      }
      break
    }
    case 'WIDGET_DELETED':
      break
    default:
      break
  }
}
