/**
 * Tests for widgetDataService — save/load/build widget data
 */
import AsyncStorage from '@react-native-async-storage/async-storage'
import { loadWidgetData, saveWidgetData } from '../widgetDataService'
import type { WidgetData } from '../widgetDataService'

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn().mockResolvedValue(undefined),
}))

jest.mock('react-native-android-widget', () => ({
  requestWidgetUpdate: jest.fn().mockResolvedValue(undefined),
}))

jest.mock('../../widgets/KoreWidget', () => ({
  KoreWidget: () => null,
}))

const WIDGET_DATA_KEY = '@kore_widget_data'

describe('widgetDataService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const sampleData: WidgetData = {
    streak: 3,
    streakTarget: 4,
    level: 5,
    nextWorkoutName: 'Push Day',
    nextWorkoutExerciseCount: 6,
    lastUpdated: 1710000000000,
  }

  // ── loadWidgetData ─────────────────────────────────────────

  describe('loadWidgetData', () => {
    it('returns null when no data stored', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null)
      const result = await loadWidgetData()
      expect(result).toBeNull()
      expect(AsyncStorage.getItem).toHaveBeenCalledWith(WIDGET_DATA_KEY)
    })

    it('returns parsed data when stored', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(sampleData))
      const result = await loadWidgetData()
      expect(result).toEqual(sampleData)
    })

    it('returns null on invalid JSON', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('not-json{{{')
      const result = await loadWidgetData()
      expect(result).toBeNull()
    })
  })

  // ── saveWidgetData ─────────────────────────────────────────

  describe('saveWidgetData', () => {
    it('saves data to AsyncStorage', async () => {
      await saveWidgetData(sampleData)
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        WIDGET_DATA_KEY,
        JSON.stringify(sampleData),
      )
    })

    it('triggers widget update', async () => {
      const { requestWidgetUpdate } = require('react-native-android-widget')
      await saveWidgetData(sampleData)
      expect(requestWidgetUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          widgetName: 'KoreWidget',
        }),
      )
    })
  })
})
