import type { Asset } from '@/entities/asset'
import type { AssetHolding } from '@/entities/asset-holding'

export interface RebalanceRowInput {
  asset: Asset
  holding: AssetHolding | undefined
  livePrice: number | undefined
  target: number
  fxRate: number | undefined
}

export interface RebalanceRow extends RebalanceRowInput {
  effectivePrice: number
  valueInAssetCcy: number
  valueInDisplay: number | undefined
  currentRatio: number
  targetValueInDisplay: number
  deltaInDisplay: number | undefined
  deltaQty: number | null
}

export interface RebalanceResult {
  rows: RebalanceRow[]
  totalValueInDisplay: number
  targetRatioSum: number
}

export function computeRebalance(inputs: RebalanceRowInput[]): RebalanceResult {
  const valued = inputs.map((r) => {
    const quantity = r.holding?.quantity ?? 0
    const effectivePrice =
      r.asset.type === 'cash' ? 1 : (r.livePrice ?? r.holding?.price ?? 0)
    const valueInAssetCcy = quantity * effectivePrice
    const valueInDisplay =
      r.fxRate === undefined ? undefined : valueInAssetCcy * r.fxRate
    return {
      input: r,
      quantity,
      effectivePrice,
      valueInAssetCcy,
      valueInDisplay,
    }
  })

  const totalValueInDisplay = valued.reduce(
    (sum, r) => sum + (r.valueInDisplay ?? 0),
    0,
  )

  const targetRatioSum = inputs.reduce((sum, r) => sum + r.target, 0)

  const rows: RebalanceRow[] = valued.map((v) => {
    const targetValueInDisplay = totalValueInDisplay * v.input.target
    const currentRatio =
      totalValueInDisplay > 0
        ? (v.valueInDisplay ?? 0) / totalValueInDisplay
        : 0
    const deltaInDisplay =
      v.valueInDisplay === undefined
        ? undefined
        : targetValueInDisplay - v.valueInDisplay

    const deltaQty =
      v.input.asset.type === 'stock' &&
      v.input.livePrice !== undefined &&
      v.input.livePrice > 0 &&
      v.input.fxRate !== undefined &&
      v.input.fxRate > 0 &&
      deltaInDisplay !== undefined
        ? deltaInDisplay / v.input.fxRate / v.input.livePrice
        : null

    return {
      ...v.input,
      effectivePrice: v.effectivePrice,
      valueInAssetCcy: v.valueInAssetCcy,
      valueInDisplay: v.valueInDisplay,
      currentRatio,
      targetValueInDisplay,
      deltaInDisplay,
      deltaQty,
    }
  })

  return { rows, totalValueInDisplay, targetRatioSum }
}
