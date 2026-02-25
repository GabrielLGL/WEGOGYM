import { createChartConfig } from '../chartConfig'
import { colors } from '../index'

describe('createChartConfig', () => {
  it('returns chart config with default options', () => {
    const config = createChartConfig()
    expect(config.backgroundColor).toBe(colors.card)
    expect(config.backgroundGradientFrom).toBe(colors.card)
    expect(config.backgroundGradientTo).toBe(colors.card)
    expect(config.decimalPlaces).toBe(0)
    expect(config.style).toEqual({ borderRadius: 16 })
  })

  it('color callback returns rgba blue string', () => {
    const config = createChartConfig()
    expect(config.color(0.5)).toBe('rgba(0, 122, 255, 0.5)')
    expect(config.color(1)).toBe('rgba(0, 122, 255, 1)')
    expect(config.color()).toBe('rgba(0, 122, 255, 1)')
  })

  it('labelColor callback returns rgba white string', () => {
    const config = createChartConfig()
    expect(config.labelColor(0.8)).toBe('rgba(255, 255, 255, 0.8)')
    expect(config.labelColor()).toBe('rgba(255, 255, 255, 1)')
  })

  it('respects custom decimalPlaces', () => {
    const config = createChartConfig({ decimalPlaces: 2 })
    expect(config.decimalPlaces).toBe(2)
  })

  it('includes propsForDots when showDots is true', () => {
    const config = createChartConfig({ showDots: true })
    expect(config.propsForDots).toBeDefined()
    expect(config.propsForDots!.r).toBe('4')
    expect(config.propsForDots!.strokeWidth).toBe('2')
    expect(config.propsForDots!.stroke).toBe(colors.primary)
  })

  it('does not include propsForDots when showDots is false', () => {
    const config = createChartConfig({ showDots: false })
    expect(config.propsForDots).toBeUndefined()
  })

  it('does not include propsForDots by default', () => {
    const config = createChartConfig()
    expect(config.propsForDots).toBeUndefined()
  })
})
