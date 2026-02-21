import React from 'react'
import { render, fireEvent, act } from '@testing-library/react-native'
import RestTimer from '../RestTimer'

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'Light',
    Medium: 'Medium',
    Heavy: 'Heavy',
  },
  NotificationFeedbackType: {
    Success: 'Success',
    Error: 'Error',
  },
}))

// Mock notificationService
jest.mock('../../services/notificationService', () => ({
  scheduleRestEndNotification: jest.fn().mockResolvedValue('notif-id-123'),
  cancelNotification: jest.fn().mockResolvedValue(undefined),
}))

import { scheduleRestEndNotification, cancelNotification } from '../../services/notificationService'

const mockSchedule = scheduleRestEndNotification as jest.Mock
const mockCancel = cancelNotification as jest.Mock

describe('RestTimer', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('rendu initial', () => {
    it('should afficher le label "REPOS EN COURS"', () => {
      const { getByText } = render(
        <RestTimer duration={60} onClose={jest.fn()} />
      )

      expect(getByText('REPOS EN COURS')).toBeTruthy()
    })

    it('should afficher le texte "Ignorer"', () => {
      const { getByText } = render(
        <RestTimer duration={60} onClose={jest.fn()} />
      )

      expect(getByText('Ignorer')).toBeTruthy()
    })

    it('should afficher le temps initial formaté', () => {
      const { getByText } = render(
        <RestTimer duration={90} onClose={jest.fn()} />
      )

      // Le timer doit afficher 1:30 ou 1:29 (selon le moment du rendu)
      expect(getByText(/\d+:\d{2}/)).toBeTruthy()
    })

    it('should afficher "1:00" pour une durée de 60 secondes', () => {
      const { getByText } = render(
        <RestTimer duration={60} onClose={jest.fn()} />
      )

      expect(getByText('1:00')).toBeTruthy()
    })

    it('should afficher "0:30" pour une durée de 30 secondes', () => {
      const { getByText } = render(
        <RestTimer duration={30} onClose={jest.fn()} />
      )

      expect(getByText('0:30')).toBeTruthy()
    })
  })

  describe('notifications', () => {
    it('should ne pas planifier de notification quand notificationEnabled est absent', async () => {
      render(<RestTimer duration={60} onClose={jest.fn()} />)

      await act(async () => {
        jest.runAllTimers()
      })

      expect(mockSchedule).not.toHaveBeenCalled()
    })

    it('should planifier une notification quand notificationEnabled=true', async () => {
      render(
        <RestTimer duration={90} onClose={jest.fn()} notificationEnabled={true} />
      )

      // Laisser l'effet asynchrone se déclencher
      await act(async () => {
        jest.advanceTimersByTime(0)
      })

      expect(mockSchedule).toHaveBeenCalledWith(90)
    })

    it('should annuler la notification au démontage quand notificationEnabled=true', async () => {
      const { unmount } = render(
        <RestTimer duration={90} onClose={jest.fn()} notificationEnabled={true} />
      )

      // Attendre que la promesse scheduleRestEndNotification se résolve
      await act(async () => {
        jest.advanceTimersByTime(0)
      })

      unmount()

      expect(mockCancel).toHaveBeenCalledWith('notif-id-123')
    })

    it('gère l\'erreur de scheduleRestEndNotification sans crash', async () => {
      mockSchedule.mockRejectedValueOnce(new Error('schedule failed'))

      render(<RestTimer duration={60} onClose={jest.fn()} notificationEnabled={true} />)

      // Flush la promesse rejetée — le .catch handler ne doit pas throw
      await act(async () => {
        jest.advanceTimersByTime(0)
      })

      expect(mockSchedule).toHaveBeenCalledWith(60)
    })

    it('annule la notification dans finishTimer quand notificationIdRef est défini', async () => {
      const { unmount } = render(
        <RestTimer duration={1} onClose={jest.fn()} notificationEnabled={true} />
      )

      // Laisser la promesse se résoudre pour que notificationIdRef soit défini
      await act(async () => {
        jest.advanceTimersByTime(0)
      })

      // Avancer le timer jusqu'à la fin du décompte (> 1000ms)
      await act(async () => {
        jest.advanceTimersByTime(1100)
      })

      expect(mockCancel).toHaveBeenCalledWith('notif-id-123')
      unmount()
    })

    it('annule la notification dans closeTimer quand notificationIdRef est défini', async () => {
      const { getByText, unmount } = render(
        <RestTimer duration={60} onClose={jest.fn()} notificationEnabled={true} />
      )

      // Laisser la promesse se résoudre
      await act(async () => {
        jest.advanceTimersByTime(0)
      })

      // Appuyer sur "Ignorer" → closeTimer appelé
      fireEvent.press(getByText('Ignorer'))

      // Laisser l'animation de fermeture (200ms)
      await act(async () => {
        jest.advanceTimersByTime(300)
      })

      expect(mockCancel).toHaveBeenCalledWith('notif-id-123')
      unmount()
    })
  })

  describe('interaction utilisateur', () => {
    it('should appeler onClose quand on appuie sur le timer', async () => {
      const onClose = jest.fn()
      const { getByText } = render(
        <RestTimer duration={60} onClose={onClose} />
      )

      fireEvent.press(getByText('Ignorer'))

      // Attendre l'animation de fermeture (200ms)
      await act(async () => {
        jest.advanceTimersByTime(300)
      })

      expect(onClose).toHaveBeenCalled()
    })
  })

  describe('décompte', () => {
    it('should décrémenter le timer chaque 100ms', () => {
      const { getByText } = render(
        <RestTimer duration={10} onClose={jest.fn()} />
      )

      // Temps initial
      expect(getByText('0:10')).toBeTruthy()

      // Avancer de 1 seconde
      act(() => {
        jest.advanceTimersByTime(1000)
      })

      expect(getByText('0:09')).toBeTruthy()
    })

    it('should nettoyage des timers au démontage', async () => {
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval')
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout')

      const { unmount } = render(
        <RestTimer duration={60} onClose={jest.fn()} />
      )

      unmount()

      expect(clearIntervalSpy).toHaveBeenCalled()
      // clearTimeout peut être appelé pour les haptic timers
      clearIntervalSpy.mockRestore()
      clearTimeoutSpy.mockRestore()
    })
  })
})
