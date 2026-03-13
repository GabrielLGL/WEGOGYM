/**
 * HexagonStatsCard — Radar chart en pentagone SVG (5 axes athlétiques)
 *
 * Affiche un profil athlétique normalisé sur 5 axes :
 * Force, Endurance, Volume, Régularité, Équilibre.
 * Chaque axe est normalisé dans [0, 1].
 */

import React, { useMemo } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Svg, Polygon, Line, Text as SvgText, Circle } from 'react-native-svg'
import { spacing, fontSize, borderRadius } from '../theme'
import type { ThemeColors } from '../theme'

const N = 5

export interface HexagonAxis {
  label: string
  value: number     // 0-1 normalisé
  rawValue: number
  rawMax: number
  color: string
}

interface Props {
  axes: HexagonAxis[]
  size?: number
  colors: ThemeColors
}

function getPoint(i: number, radius: number, cx: number, cy: number): { x: number; y: number } {
  const angle = (Math.PI * 2 * i) / N - Math.PI / 2
  return {
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle),
  }
}

function pointsToString(pts: { x: number; y: number }[]): string {
  return pts.map(p => `${p.x},${p.y}`).join(' ')
}

export default function HexagonStatsCard({ axes, size = 280, colors }: Props) {
  const cx = size / 2
  const cy = size / 2
  const R = size * 0.35

  const gridLevels = [0.33, 0.66, 1.0]

  // Grilles concentriques
  const gridPolygons = useMemo(
    () => gridLevels.map(level => {
      const pts = Array.from({ length: N }, (_, i) => getPoint(i, R * level, cx, cy))
      return pointsToString(pts)
    }),
    [R, cx, cy],
  )

  // Axes (lignes du centre aux sommets)
  const axisLines = useMemo(
    () => Array.from({ length: N }, (_, i) => {
      const pt = getPoint(i, R, cx, cy)
      return { x1: cx, y1: cy, x2: pt.x, y2: pt.y }
    }),
    [R, cx, cy],
  )

  // Polygone des valeurs utilisateur
  const dataPolygon = useMemo(
    () => {
      const pts = axes.map((axis, i) => {
        const clamped = Math.max(0.03, Math.min(1, axis.value)) // min 3% pour visibilité à 0
        return getPoint(i, R * clamped, cx, cy)
      })
      return pointsToString(pts)
    },
    [axes, R, cx, cy],
  )

  // Labels positionnés en dehors du pentagone
  const labelPositions = useMemo(
    () => axes.map((axis, i) => {
      const labelR = R * 1.3
      const pt = getPoint(i, labelR, cx, cy)
      return { ...pt, label: axis.label }
    }),
    [axes, R, cx, cy],
  )

  // Score global moyen (0-100%)
  const avgScore = useMemo(
    () => Math.round((axes.reduce((sum, a) => sum + Math.min(1, a.value), 0) / N) * 100),
    [axes],
  )

  const styles = useStyles(colors)

  return (
    <View style={[styles.container, { width: size + 40, alignSelf: 'center' }]}>
      <Svg width={size + 40} height={size + 20} viewBox={`-20 -10 ${size + 40} ${size + 20}`}>
        {/* Grilles concentriques */}
        {gridPolygons.map((pts, idx) => (
          <Polygon
            key={`grid-${idx}`}
            points={pts}
            fill="none"
            stroke={colors.separator}
            strokeWidth={1}
          />
        ))}

        {/* Lignes des axes */}
        {axisLines.map((line, idx) => (
          <Line
            key={`axis-${idx}`}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke={colors.separator}
            strokeWidth={1}
          />
        ))}

        {/* Polygone rempli — valeurs utilisateur */}
        <Polygon
          points={dataPolygon}
          fill={`${colors.primary}4D`}
          stroke={colors.primary}
          strokeWidth={2}
          strokeLinejoin="round"
        />

        {/* Points aux sommets */}
        {axes.map((axis, i) => {
          const clamped = Math.max(0.03, Math.min(1, axis.value))
          const pt = getPoint(i, R * clamped, cx, cy)
          return (
            <Circle
              key={`dot-${i}`}
              cx={pt.x}
              cy={pt.y}
              r={4}
              fill={colors.primary}
            />
          )
        })}

        {/* Labels des axes */}
        {labelPositions.map((lp, idx) => (
          <SvgText
            key={`label-${idx}`}
            x={lp.x}
            y={lp.y}
            fill={colors.textSecondary}
            fontSize={11}
            textAnchor="middle"
            alignmentBaseline="middle"
          >
            {lp.label}
          </SvgText>
        ))}

        {/* Score global au centre */}
        <SvgText
          x={cx}
          y={cy - 8}
          fill={colors.text}
          fontSize={20}
          fontWeight="700"
          textAnchor="middle"
          alignmentBaseline="middle"
        >
          {avgScore}%
        </SvgText>
        <SvgText
          x={cx}
          y={cy + 12}
          fill={colors.textSecondary}
          fontSize={10}
          textAnchor="middle"
          alignmentBaseline="middle"
        >
          score global
        </SvgText>
      </Svg>
    </View>
  )
}

function useStyles(colors: ThemeColors) {
  return useMemo(() => StyleSheet.create({
    container: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      paddingVertical: spacing.md,
      alignItems: 'center',
      marginBottom: spacing.md,
    },
  }), [colors])
}
