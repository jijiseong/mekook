import { useQueries } from '@tanstack/react-query'
import { useAssets } from '@/entities/asset'
import { useAssetHoldings } from '@/entities/asset-holding'
import { useAssetTargets } from '@/entities/asset-target'
import { useCategoryTargets } from '@/entities/category-target'
import { quoteQueryOptions } from '@/entities/quote'
import { DEFAULT_CURRENCY, type Currency } from '@/shared/lib/currency'
import { computeRebalance, type RebalanceRow } from './rebalance'
import { effectiveTargetRatio } from './effective-targets'

export interface PortfolioData {
  displayCurrency: Currency
  rows: RebalanceRow[]
  totalValueInDisplay: number
  targetRatioSum: number
  stockRows: RebalanceRow[]
  cashRows: RebalanceRow[]
  isBalanced: boolean
  totalBuy: number
  totalSell: number
}

export function usePortfolioData(): PortfolioData {
  const displayCurrency = DEFAULT_CURRENCY
  const assets = useAssets()
  const holdings = useAssetHoldings()
  const targets = useAssetTargets()
  const categoryTargets = useCategoryTargets()

  const stocks = assets.filter((a) => a.type === 'stock')

  const quoteQueries = useQueries({
    queries: stocks.map((s) => quoteQueryOptions(s.symbol)),
  })

  const livePriceBySymbol = new Map<string, number>()
  stocks.forEach((s, i) => {
    const price = quoteQueries[i]?.data?.price
    if (price !== undefined) livePriceBySymbol.set(s.symbol, price)
  })

  const holdingByAsset = new Map(holdings.map((h) => [h.assetId, h]))

  const inputs = assets.map((asset) => {
    const id = asset.id
    const holding = id !== undefined ? holdingByAsset.get(id) : undefined
    const livePrice =
      asset.type === 'stock' ? livePriceBySymbol.get(asset.symbol) : undefined
    const target = effectiveTargetRatio(asset, targets, categoryTargets)
    return { asset, holding, livePrice, target, fxRate: 1 }
  })

  const { rows, totalValueInDisplay, targetRatioSum } = computeRebalance(inputs)

  const stockRows = rows.filter((r) => r.asset.type === 'stock')
  const cashRows = rows.filter((r) => r.asset.type === 'cash')

  const isBalanced = Math.abs(targetRatioSum - 1) < 0.0005
  const totalBuy = rows
    .filter((r) => (r.deltaInDisplay ?? 0) > 0)
    .reduce((s, r) => s + (r.deltaInDisplay ?? 0), 0)
  const totalSell = rows
    .filter((r) => (r.deltaInDisplay ?? 0) < 0)
    .reduce((s, r) => s + (r.deltaInDisplay ?? 0), 0)

  return {
    displayCurrency,
    rows,
    totalValueInDisplay,
    targetRatioSum,
    stockRows,
    cashRows,
    isBalanced,
    totalBuy,
    totalSell,
  }
}
