import { useQueries } from '@tanstack/react-query'
import { useAssets } from '@/entities/asset'
import { useAssetHoldings } from '@/entities/asset-holding'
import { useAssetTargets } from '@/entities/asset-target'
import { useCategoryTargets } from '@/entities/category-target'
import { quoteQueryOptions } from '@/entities/quote'
import { fxRateQueryOptions } from '@/entities/fx-rate'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card'
import { useCurrency } from '@/shared/lib/currency-context'
import type { Currency } from '@/shared/lib/currency'
import { cn } from '@/shared/lib/utils'
import {
  computeRebalance,
  type RebalanceRow,
  type RebalanceRowInput,
} from '../lib/rebalance'
import { effectiveTargetRatio } from '../lib/effective-targets'
import { formatMoney, formatRatio, formatSignedMoney } from '../lib/format'
import { getAssetColor } from '@/shared/lib/asset-color'
import { PortfolioChart } from './portfolio-chart'
import { PortfolioRow } from './portfolio-row'
import { AllocationPie, type AllocationPieItem } from './allocation-pie'

const SUPPORTED_CURRENCIES = ['KRW', 'USD'] satisfies readonly Currency[]

function isSupportedCurrency(c: string): c is Currency {
  return SUPPORTED_CURRENCIES.some((sc) => sc === c)
}

function groupTotal(
  rows: RebalanceRow[],
  key: 'valueInDisplay' | 'deltaInDisplay',
) {
  if (rows.some((r) => r[key] === undefined)) return undefined
  return rows.reduce((s, r) => s + (r[key] ?? 0), 0)
}

interface GroupHeaderProps {
  label: string
  totalValue: number | undefined
  totalRatio: number
  totalDelta: number | undefined
  displayCurrency: Currency
}

function GroupHeader({
  label,
  totalValue,
  totalRatio,
  totalDelta,
  displayCurrency,
}: GroupHeaderProps) {
  const deltaColor =
    totalDelta === undefined || Math.abs(totalDelta) < 0.5
      ? 'text-muted-foreground'
      : totalDelta > 0
        ? 'text-emerald-600'
        : 'text-rose-600'

  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-3 border-b py-2 sm:grid-cols-[2fr_1.4fr_1.2fr_0.8fr_1.6fr_auto]">
      <span className="text-sm font-semibold">{label}</span>
      {/* 보유 — 데스크톱만 */}
      <span className="hidden sm:block" />
      {/* 평가액 */}
      <span className="hidden tabular-nums sm:block sm:text-right">
        {totalValue !== undefined
          ? formatMoney(totalValue, displayCurrency)
          : '—'}
      </span>
      {/* 현재% */}
      <span className="hidden text-muted-foreground tabular-nums sm:block sm:text-right">
        {formatRatio(totalRatio)}
      </span>
      {/* 리밸런싱 */}
      <span
        className={cn('hidden tabular-nums sm:block sm:text-right', deltaColor)}
      >
        {totalDelta === undefined
          ? '—'
          : Math.abs(totalDelta) < 0.5
            ? '균형'
            : formatSignedMoney(totalDelta, displayCurrency)}
      </span>
      {/* 삭제 버튼 자리 */}
      <span className="inline-block w-8" />
    </div>
  )
}

export function PortfolioTable() {
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
  const fxError = fxQueries.find((q) => q.error)?.error

  const holdingByAsset = new Map(holdings.map((h) => [h.assetId, h]))

  const inputs: RebalanceRowInput[] = assets.map((asset) => {
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

  const allKeys = rows.map((r) => r.asset.symbol || r.asset.name)

  const targetItems: AllocationPieItem[] = rows.map((row) => {
    const key = row.asset.symbol || row.asset.name
    return {
      id: row.asset.id ?? key,
      label: key,
      ratio: row.target,
      color: getAssetColor(key, allKeys),
    }
  })

  const currentItems: AllocationPieItem[] = rows.map((row) => {
    const key = row.asset.symbol || row.asset.name
    return {
      id: row.asset.id ?? key,
      label: key,
      ratio: row.currentRatio,
      color: getAssetColor(key, allKeys),
    }
  })

  const stockRows = rows.filter((r) => r.asset.type === 'stock')
  const cashRows = rows.filter((r) => r.asset.type === 'cash')

  const isBalanced = Math.abs(targetRatioSum - 1) < 0.0005
  const totalBuy = rows
    .filter((r) => (r.deltaInDisplay ?? 0) > 0)
    .reduce((s, r) => s + (r.deltaInDisplay ?? 0), 0)
  const totalSell = rows
    .filter((r) => (r.deltaInDisplay ?? 0) < 0)
    .reduce((s, r) => s + (r.deltaInDisplay ?? 0), 0)

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <CardDescription>총 평가액</CardDescription>
            <CardTitle className="text-3xl font-semibold tabular-nums">
              {formatMoney(totalValueInDisplay, displayCurrency)}
            </CardTitle>
            {fxError && (
              <p className="text-destructive text-xs">환율 조회 실패</p>
            )}
            {fxLoading && (
              <p className="text-muted-foreground text-xs">환율 불러오는 중…</p>
            )}
          </div>
          <div className="flex flex-col items-end gap-1 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">목표 합</span>
              <span
                className={cn(
                  'font-semibold tabular-nums',
                  isBalanced ? 'text-foreground' : 'text-destructive',
                )}
              >
                {formatRatio(targetRatioSum)}
              </span>
            </div>
            {!isBalanced && (
              <span className="text-destructive text-xs">
                {targetRatioSum < 1
                  ? `${formatRatio(1 - targetRatioSum)} 부족`
                  : `${formatRatio(targetRatioSum - 1)} 초과`}
              </span>
            )}
            <div className="text-muted-foreground flex items-center gap-3 text-xs">
              <span>매수 {formatMoney(totalBuy, displayCurrency)}</span>
              <span>
                매도 {formatMoney(Math.abs(totalSell), displayCurrency)}
              </span>
            </div>
          </div>
        </CardHeader>
      </Card>

      {rows.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>현재 vs 목표</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="flex flex-col items-center gap-3">
                <p className="text-muted-foreground text-sm font-medium">
                  목표
                </p>
                <AllocationPie items={targetItems} showLabels />
              </div>
              <div className="flex flex-col items-center gap-3">
                <p className="text-muted-foreground text-sm font-medium">
                  현재
                </p>
                <AllocationPie items={currentItems} showLabels />
              </div>
              <div className="flex flex-col items-center gap-3">
                <p className="text-muted-foreground text-sm font-medium">
                  목표 vs 현재
                </p>
                <PortfolioChart rows={rows} />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>자산</CardTitle>
          <CardDescription>
            종목과 현금을 한곳에서 비교하세요. 목표 비중은 위의 "목표 포트폴리오
            비율" 섹션에서 설정합니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <p className="text-muted-foreground text-sm">자산이 없습니다.</p>
          ) : (
            <div className="flex flex-col">
              {/* 컬럼 헤더 */}
              <div className="text-muted-foreground hidden grid-cols-[2fr_1.4fr_1.2fr_0.8fr_1.6fr_auto] items-center gap-3 border-b pb-2 text-xs sm:grid">
                <span>자산</span>
                <span className="text-right">보유</span>
                <span className="text-right">평가액</span>
                <span className="text-right">현재%</span>
                <span className="text-right">리밸런싱</span>
                <span />
              </div>

              {/* 주식 그룹 */}
              {stockRows.length > 0 && (
                <>
                  <GroupHeader
                    label="주식"
                    totalValue={groupTotal(stockRows, 'valueInDisplay')}
                    totalRatio={stockRows.reduce(
                      (s, r) => s + r.currentRatio,
                      0,
                    )}
                    totalDelta={groupTotal(stockRows, 'deltaInDisplay')}
                    displayCurrency={displayCurrency}
                  />
                  {stockRows.map((row) => (
                    <PortfolioRow
                      key={row.asset.id ?? row.asset.symbol}
                      row={row}
                      displayCurrency={displayCurrency}
                      indented
                    />
                  ))}
                </>
              )}

              {/* 현금 그룹 */}
              {cashRows.length > 0 && (
                <>
                  <GroupHeader
                    label="현금"
                    totalValue={groupTotal(cashRows, 'valueInDisplay')}
                    totalRatio={cashRows.reduce(
                      (s, r) => s + r.currentRatio,
                      0,
                    )}
                    totalDelta={groupTotal(cashRows, 'deltaInDisplay')}
                    displayCurrency={displayCurrency}
                  />
                  {cashRows.map((row) => (
                    <PortfolioRow
                      key={row.asset.id ?? row.asset.symbol}
                      row={row}
                      displayCurrency={displayCurrency}
                      indented
                    />
                  ))}
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
