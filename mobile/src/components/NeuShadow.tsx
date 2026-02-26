import React from 'react'
import type { StyleProp, ViewStyle } from 'react-native'
import { Shadow } from 'react-native-shadow-2'
import { useTheme } from '../contexts/ThemeContext'
import { neuShadowParams, borderRadius as defaultBorderRadius } from '../theme'

type NeuShadowLevel = 'elevated' | 'elevatedSm' | 'pressed'

interface NeuShadowProps {
  /** Niveau d'élévation de l'ombre. Défaut : 'elevated' */
  level?: NeuShadowLevel
  children: React.ReactNode
  /** Style appliqué au conteneur extérieur (layout : margin…).
   * Correspond à `containerStyle` de react-native-shadow-2. */
  style?: StyleProp<ViewStyle>
  /** Border radius de l'élément enveloppé. Doit correspondre au borderRadius de l'enfant. */
  radius?: number
  /** Désactive les ombres (rendu direct des enfants). */
  disabled?: boolean
  /** Étire le composant pour remplir l'axe transversal (shortcut alignSelf: 'stretch'). */
  stretch?: boolean
}

/**
 * NeuShadow — Vrai neumorphisme via react-native-shadow-2
 *
 * Enveloppe les enfants dans deux Shadow SVG imbriqués :
 * - ombre sombre bas-droite (offset positif)
 * - ombre claire haut-gauche (offset négatif)
 *
 * Prérequis : backgroundColor de l'enfant === backgroundColor du fond.
 *
 * @example
 * <NeuShadow level="elevatedSm" radius={borderRadius.md} style={{ marginBottom: 16 }}>
 *   <View style={{ backgroundColor: colors.card, borderRadius: borderRadius.md }}>
 *     ...
 *   </View>
 * </NeuShadow>
 */
export const NeuShadow: React.FC<NeuShadowProps> = ({
  level = 'elevated',
  children,
  style,
  radius = defaultBorderRadius.md,
  disabled = false,
  stretch = false,
}) => {
  const { mode } = useTheme()

  if (disabled) {
    return <>{children}</>
  }

  const params = neuShadowParams[mode][level]
  const cornerStyle: ViewStyle = { borderRadius: radius }

  return (
    <Shadow
      distance={params.distance}
      offset={[params.offset, params.offset]}
      startColor={params.darkColor}
      endColor="transparent"
      style={cornerStyle}
      containerStyle={style}
      stretch={stretch}
      paintInside={false}
    >
      <Shadow
        distance={params.distance}
        offset={[-params.offset, -params.offset]}
        startColor={params.lightColor}
        endColor="transparent"
        style={cornerStyle}
        paintInside={false}
      >
        {children}
      </Shadow>
    </Shadow>
  )
}
