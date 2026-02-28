import React, { useState, useMemo } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  useWindowDimensions,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import withObservables from '@nozbe/with-observables'
import { Q } from '@nozbe/watermelondb'
import { LineChart } from 'react-native-chart-kit'

import { database } from '../model'
import BodyMeasurement from '../model/models/BodyMeasurement'
import { BottomSheet } from '../components/BottomSheet'
import { AlertDialog } from '../components/AlertDialog'
import { ChipSelector } from '../components/ChipSelector'
import { Button } from '../components/Button'
import { useHaptics } from '../hooks/useHaptics'
import { useModalState } from '../hooks/useModalState'
import { spacing, borderRadius, fontSize } from '../theme'
import { useColors } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import type { ThemeColors } from '../theme'
import { createChartConfig } from '../theme/chartConfig'
import { parseNumericInput } from '../model/utils/databaseHelpers'

// ─── Métrique selector ────────────────────────────────────────────────────────

type MetricKey = 'weight' | 'waist' | 'hips' | 'arms' | 'chest'

const METRICS: Array<{ key: MetricKey; label: string; unit: string }> = [
  { key: 'weight', label: 'Poids', unit: 'kg' },
  { key: 'waist', label: 'Tour de taille', unit: 'cm' },
  { key: 'hips', label: 'Hanches', unit: 'cm' },
  { key: 'arms', label: 'Bras', unit: 'cm' },
  { key: 'chest', label: 'Poitrine', unit: 'cm' },
]

// ─── Formulaire ───────────────────────────────────────────────────────────────

interface FormState {
  weight: string
  waist: string
  hips: string
  arms: string
  chest: string
}

const EMPTY_FORM: FormState = {
  weight: '',
  waist: '',
  hips: '',
  arms: '',
  chest: '',
}

// ─── Composant principal ──────────────────────────────────────────────────────

interface Props {
  measurements: BodyMeasurement[]
}

export function StatsMeasurementsScreenBase({ measurements }: Props) {
  const colors = useColors()
  const styles = useStyles(colors)
  const chartConfig = createChartConfig({ decimalPlaces: 1, showDots: true, colors })
  const { width: screenWidth, height: screenHeight } = useWindowDimensions()
  const haptics = useHaptics()
  const { t, language } = useLanguage()
  const addSheet = useModalState()
  const [deleteTarget, setDeleteTarget] = useState<BodyMeasurement | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [selectedMetric, setSelectedMetric] = useState<string>('weight')

  const locale = language === 'fr' ? 'fr-FR' : 'en-US'

  const metricsLabelMap = useMemo<Record<string, string>>(() => ({
    weight: t.statsMeasurements.weight,
    waist: t.statsMeasurements.waist,
    hips: t.statsMeasurements.hips,
    arms: t.statsMeasurements.arms,
    chest: t.statsMeasurements.chest,
  }), [t])

  // Donnée la plus récente
  const latest = measurements[0] ?? null

  // Graphique pour la métrique sélectée
  const metricKey = selectedMetric as MetricKey
  const metricUnit = METRICS.find(m => m.key === selectedMetric)?.unit ?? 'kg'

  const chartData = useMemo(() => {
    const points = measurements
      .filter(m => m[metricKey] != null)
      .slice(0, 20)
      .reverse()
    if (points.length < 2) return null
    return {
      labels: points.map((m, i) =>
        i % 4 === 0
          ? new Date(m.date).toLocaleDateString(locale, { day: '2-digit', month: '2-digit' })
          : ''
      ),
      datasets: [{ data: points.map(m => m[metricKey] as number) }],
    }
  }, [measurements, metricKey, locale])

  // Validation : au moins 1 champ rempli
  const isFormValid = Object.values(form).some(v => v.trim() !== '')

  const handleSave = async () => {
    if (!isFormValid) return
    try {
      await database.write(async () => {
        await database.get<BodyMeasurement>('body_measurements').create(record => {
          record.date = Date.now()
          record.weight = form.weight ? parseNumericInput(form.weight) : null
          record.waist = form.waist ? parseNumericInput(form.waist) : null
          record.hips = form.hips ? parseNumericInput(form.hips) : null
          record.arms = form.arms ? parseNumericInput(form.arms) : null
          record.chest = form.chest ? parseNumericInput(form.chest) : null
        })
      })
      haptics.onSuccess()
      setForm(EMPTY_FORM)
      addSheet.close()
    } catch {
      // Erreur DB silencieuse
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await database.write(async () => {
        await deleteTarget.destroyPermanently()
      })
      haptics.onDelete()
    } catch {
      // Erreur DB silencieuse
    } finally {
      setDeleteTarget(null)
    }
  }

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Bouton ajouter */}
        <View style={styles.addRow}>
          <Button
            variant="primary"
            size="sm"
            onPress={() => { haptics.onPress(); addSheet.open() }}
          >
            {t.statsMeasurements.addButton}
          </Button>
        </View>

        {/* Dernière mesure */}
        {latest && (
          <>
            <Text style={styles.sectionTitle}>
              {t.statsMeasurements.latestTitle} — {new Date(latest.date).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })}
            </Text>
            <View style={styles.latestGrid}>
              {METRICS.map(m => (
                latest[m.key] != null ? (
                  <View key={m.key} style={styles.latestCard}>
                    <Text style={styles.latestValue}>{latest[m.key]}{m.unit}</Text>
                    <Text style={styles.latestLabel}>{m.label}</Text>
                  </View>
                ) : null
              ))}
            </View>
          </>
        )}

        {/* Graphique */}
        <ChipSelector
          items={METRICS.map(m => m.key)}
          selectedValue={selectedMetric}
          onChange={v => { if (v) setSelectedMetric(v) }}
          allowNone={false}
          noneLabel=""
          labelMap={metricsLabelMap}
        />

        {chartData ? (
          <View style={styles.chartWrapper}>
            <LineChart
              data={chartData}
              width={screenWidth - spacing.md * 2}
              height={180}
              chartConfig={chartConfig}
              style={styles.chart}
              fromZero={false}
              formatYLabel={val => `${val}${metricUnit}`}
              formatXLabel={val => val}
            />
          </View>
        ) : (
          <View style={styles.emptyChart}>
            <Text style={styles.emptyText}>
              {t.statsMeasurements.chartEmpty}
            </Text>
          </View>
        )}

        {/* Historique */}
        {measurements.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: spacing.lg }]}>{t.statsMeasurements.historyTitle}</Text>
            <View style={styles.card}>
              {measurements.map((m, i) => (
                <View
                  key={m.id}
                  style={[styles.historyRow, i < measurements.length - 1 && styles.rowBorder]}
                >
                  <View style={styles.historyLeft}>
                    <Text style={styles.historyDate}>
                      {new Date(m.date).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' })}
                    </Text>
                    <Text style={styles.historyValues} numberOfLines={1}>
                      {[
                        m.weight ? `${m.weight}kg` : null,
                        m.waist ? `T:${m.waist}cm` : null,
                        m.hips ? `H:${m.hips}cm` : null,
                        m.arms ? `B:${m.arms}cm` : null,
                        m.chest ? `P:${m.chest}cm` : null,
                      ].filter(Boolean).join(' · ')}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => { haptics.onPress(); setDeleteTarget(m) }}
                    style={styles.deleteBtn}
                    testID="delete-btn"
                  >
                    <Ionicons name="trash-outline" size={20} color={colors.danger} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </>
        )}

        {measurements.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              {t.statsMeasurements.noData}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* BottomSheet ajout */}
      <BottomSheet
        visible={addSheet.isOpen}
        onClose={addSheet.close}
        title={t.statsMeasurements.addSheetTitle}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          style={{ maxHeight: screenHeight * 0.6 }}
        >
          <View style={styles.formContent}>
            {METRICS.map(m => (
              <View key={m.key} style={styles.inputRow}>
                <Text style={styles.inputLabel}>{metricsLabelMap[m.key] ?? m.label} ({m.unit})</Text>
                <TextInput
                  style={styles.input}
                  value={form[m.key]}
                  onChangeText={val => setForm(prev => ({ ...prev, [m.key]: val }))}
                  keyboardType="decimal-pad"
                  placeholder="—"
                  placeholderTextColor={colors.placeholder}
                />
              </View>
            ))}
            <View style={styles.formButtons}>
              <Button variant="secondary" size="md" onPress={addSheet.close}>
                {t.common.cancel}
              </Button>
              <Button variant="primary" size="md" onPress={handleSave}>
                {t.common.save}
              </Button>
            </View>
          </View>
        </ScrollView>
      </BottomSheet>

      {/* AlertDialog suppression */}
      <AlertDialog
        visible={deleteTarget !== null}
        title={t.statsMeasurements.deleteTitle}
        message={t.statsMeasurements.deleteMessage}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        confirmText={t.statsMeasurements.deleteConfirm}
        cancelText={t.statsMeasurements.deleteCancel}
        confirmColor={colors.danger}
      />
    </>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

function useStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: spacing.md,
      paddingBottom: spacing.xl,
    },
    addRow: {
      alignItems: 'flex-end',
      marginBottom: spacing.md,
    },
    sectionTitle: {
      fontSize: fontSize.md,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.sm,
    },
    latestGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
      marginBottom: spacing.md,
    },
    latestCard: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.sm,
      padding: spacing.sm,
      alignItems: 'center',
      minWidth: '30%',
      flex: 1,
    },
    latestValue: {
      fontSize: fontSize.lg,
      fontWeight: '700',
      color: colors.primary,
    },
    latestLabel: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
      marginTop: 2,
    },
    chartWrapper: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.md,
      overflow: 'hidden',
      marginTop: spacing.sm,
    },
    chart: {
      borderRadius: borderRadius.md,
    },
    emptyChart: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      alignItems: 'center',
      marginTop: spacing.sm,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.md,
      overflow: 'hidden',
    },
    historyRow: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.md,
    },
    rowBorder: {
      borderBottomWidth: 1,
      borderBottomColor: colors.separator,
    },
    historyLeft: {
      flex: 1,
    },
    historyDate: {
      fontSize: fontSize.sm,
      fontWeight: '600',
      color: colors.text,
    },
    historyValues: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
      marginTop: 2,
    },
    deleteBtn: {
      padding: spacing.xs,
    },
    emptyState: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.md,
      padding: spacing.lg,
      alignItems: 'center',
    },
    emptyText: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    // Form
    formContent: {
      padding: spacing.md,
      gap: spacing.md,
    },
    inputRow: {
      gap: spacing.xs,
    },
    inputLabel: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
    },
    input: {
      backgroundColor: colors.cardSecondary,
      borderRadius: borderRadius.sm,
      padding: spacing.sm,
      fontSize: fontSize.md,
      color: colors.text,
    },
    formButtons: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginTop: spacing.sm,
    },
  })
}

// ─── withObservables ──────────────────────────────────────────────────────────

const enhance = withObservables([], () => ({
  measurements: database
    .get<BodyMeasurement>('body_measurements')
    .query(Q.sortBy('date', Q.desc))
    .observe(),
}))

export default enhance(StatsMeasurementsScreenBase)
