import { useQueries } from '@tanstack/react-query'
import { useAssets } from '@/entities/asset'
import { useAssetHoldings } from '@/entities/asset-holding'
import { useAssetTargets } from '@/entities/asset-target'
import { useCategoryTargets } from '@/entities/category-target'
import { quoteQueryOptions } from '@/entities/quote'
import { fxRateQueryOptions } from '@/entities/fx-rate'
import { useCurrency } from '@/shared/lib/currency-context'
import type { Currency } from '@/shared/lib/currency'
import { computeRebalance, type RebalanceRow } from './rebalance'
import { effectiveTargetRatio } from './effective-targets'

const SUPPORTED_CURRENCIES = ['KRW', 'USD'] satisfies readonly Currency[]

function isSupportedCurrency(c: string): c is Currency {
  return SUPPORTED_CURRENCIES.some((sc) => sc === c)
}

export interface PortfolioData {
  displayCurrency: Currency
  rows: RebalanceRow[]
  totalValueInDisplay: number
  targetRatioSum: number
  fxLoading: boolean
  fxError: Error | null
  stockRows: RebalanceRow[]
  cashRows: RebalanceRow[]
  isBalanced: boolean
  totalBuy: number
  totalSell: number
}

export function usePortfolioData(): PortfolioData {
  const { currency: displayCurrency } = useCurrency()
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

  const distinctCurrencies = Array.from(
    new Set(
      assets
        .map((a) => a.currency)
        .filter(isSupportedCurrency)
        .concat(displayCurrency),
    ),
  )

  const fxQueries = useQueries({
    queries: distinctCurrencies.map((from) =>
      fxRateQueryOptions(from, displayCurrency),
    ),
  })

  const fxRateByCurrency = new Map<Currency, number | undefined>()
  distinctCurrencies.forEach((from, i) => {
    if (from === displayCurrency) {
      fxRateByCurrency.set(from, 1)
      return
    }
    fxRateByCurrency.set(from, fxQueries[i]?.data?.rate)
  })

  const fxLoading = fxQueries.some((q) => q.isLoading)
  const fxError = fxQueries.find((q) => q.error)?.error ?? null

  const holdingByAsset = new Map(holdings.map((h) => [h.assetId, h]))

  const inputs = assets.map((asset) => {
    const id = asset.id
    const holding = id !== undefined ? holdingByAsset.get(id) : undefined
    const livePrice =
      asset.type === 'stock' ? livePriceBySymbol.get(asset.symbol) : undefined
    const target = effectiveTargetRatio(asset, targets, categoryTargets)
    const assetCurrency: Currency = isSupportedCurrency(asset.currency)
      ? asset.currency
      : displayCurrency
    const fxRate = fxRateByCurrency.get(assetCurrency)
    return { asset, holding, livePrice, target, fxRate }
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
    fxLoading,
    fxError,
    stockRows,
    cashRows,
    isBalanced,
    totalBuy,
    totalSell,
  }
}
