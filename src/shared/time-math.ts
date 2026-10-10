export type EstimationAccuracyResult = {
  estimatedMinutes: number
  actualMinutes: number
  accuracyPercentage: number
  biasPercentage: number
  biasType: 'underestimated' | 'overestimated' | 'accurate'
  suggestion: string
}

/** Same shape as EstimationAccuracyResult; represents an aggregate across many work items. */
export type AggregatedAccuracyResult = EstimationAccuracyResult

export function computeNetSessionMinutes(
  startTimeMs: number,
  endTimeMs: number,
  pausedDurationMs = 0
): number {
  const grossMs = Math.max(0, endTimeMs - startTimeMs)
  const netMs = Math.max(0, grossMs - pausedDurationMs)
  return Math.floor(netMs / 60000)
}

export function computeRemainingWorkMinutes(
  estimatedMinutes: number,
  actualMinutes: number
): number {
  return Math.max(0, (estimatedMinutes || 0) - (actualMinutes || 0))
}

export function calculateEstimationAccuracy(
  estimatedMinutes: number,
  actualMinutes: number
): EstimationAccuracyResult {
  const est = Math.max(0, estimatedMinutes || 0)
  const act = Math.max(0, actualMinutes || 0)

  if (est === 0) {
    return {
      estimatedMinutes: 0,
      actualMinutes: act,
      accuracyPercentage: 100,
      biasPercentage: 0,
      biasType: 'accurate',
      suggestion: 'No initial estimate provided for comparison.'
    }
  }

  const accuracyPercentage = Math.round((act / est) * 100)
  const biasPercentage = Math.round(((act - est) / est) * 100)

  let biasType: 'underestimated' | 'overestimated' | 'accurate' = 'accurate'
  let suggestion = 'Your estimation accuracy is well aligned with actual duration.'

  if (biasPercentage > 5) {
    biasType = 'underestimated'
    suggestion = `Tasks take approximately ${biasPercentage}% longer than your estimates. Consider adding a ${biasPercentage}% buffer to future tasks.`
  } else if (biasPercentage < -5) {
    biasType = 'overestimated'
    suggestion = `Tasks take approximately ${Math.abs(biasPercentage)}% less time than your estimates.`
  }

  return {
    estimatedMinutes: est,
    actualMinutes: act,
    accuracyPercentage,
    biasPercentage,
    biasType,
    suggestion
  }
}

export function aggregateEstimationAccuracy(
  items: { estimatedMinutes: number; actualMinutes: number }[]
): EstimationAccuracyResult {
  let totalEst = 0
  let totalAct = 0

  for (const item of items) {
    if ((item.estimatedMinutes || 0) > 0) {
      totalEst += item.estimatedMinutes
      totalAct += item.actualMinutes
    }
  }

  return calculateEstimationAccuracy(totalEst, totalAct)
}
