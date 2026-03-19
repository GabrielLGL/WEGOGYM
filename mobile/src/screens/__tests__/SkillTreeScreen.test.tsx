import React from 'react'
import { render } from '@testing-library/react-native'
import { SkillTreeScreenBase } from '../SkillTreeScreen'

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium', Heavy: 'Heavy' },
  NotificationFeedbackType: { Success: 'Success', Error: 'Error' },
}))

jest.mock('../../model/index', () => ({
  database: { write: jest.fn(), get: jest.fn() },
}))

jest.mock('../../components/SkillTreeBranch', () => ({
  SkillTreeBranch: 'SkillTreeBranch',
}))

function makeUser(overrides: Record<string, unknown> = {}) {
  return {
    totalPrs: 0,
    totalTonnage: 0,
    bestStreak: 0,
    ...overrides,
  } as never
}

function makeSet(exerciseId: string) {
  return {
    exercise: { id: exerciseId },
  } as never
}

describe('SkillTreeScreenBase', () => {
  it('rend sans crash si user null', () => {
    const { toJSON } = render(
      <SkillTreeScreenBase user={null} sets={[]} />,
    )
    expect(toJSON()).toBeTruthy()
  })

  it('rend sans crash avec user sans données (tout verrouillé)', () => {
    const { toJSON } = render(
      <SkillTreeScreenBase user={makeUser()} sets={[]} />,
    )
    expect(toJSON()).toBeTruthy()
  })

  it('affiche les 4 branches avec des données', () => {
    const sets = [
      makeSet('e1'),
      makeSet('e2'),
      makeSet('e3'),
    ]
    const { toJSON } = render(
      <SkillTreeScreenBase
        user={makeUser({ totalPrs: 10, totalTonnage: 5000, bestStreak: 8 })}
        sets={sets}
      />,
    )
    expect(toJSON()).toBeTruthy()
  })
})
