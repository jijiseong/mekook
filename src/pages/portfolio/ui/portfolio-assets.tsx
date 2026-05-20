import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card'
import { cn } from '@/shared/lib/utils'
import type { Currency } from '@/shared/lib/currency'
import { usePortfolioData } from '../lib/use-portfolio-data'
import { formatMoney, formatRatio, formatSignedMoney } from '../lib/format'
import type { RebalanceRow } from '../lib/rebalance'
import { PortfolioRow } from './portfolio-row'

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
      <span className="hidden sm:block" />
      <span className="hidden tabular-nums sm:block sm:text-right">
        {totalValue !== undefined
          ? formatMoney(totalValue, displayCurrency)
          : '—'}
      </span>
      <span className="hidden text-muted-foreground tabular-nums sm:block sm:text-right">
        {formatRatio(totalRatio)}
      </span>
      <span
        className={cn('hidden tabular-nums sm:block sm:text-right', deltaColor)}
      >
        {totalDelta === undefined
          ? '—'
          : Math.abs(totalDelta) < 0.5
            ? '균형'
            : formatSignedMoney(totalDelta, displayCurrency)}
      </span>
      <span className="inline-block w-8" />
    </div>
  )
}

export function PortfolioAssets() {
  const { displayCurrency, rows, stockRows, cashRows } = usePortfolioData()

  return (
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
            <div className="text-muted-foreground hidden grid-cols-[2fr_1.4fr_1.2fr_0.8fr_1.6fr_auto] items-center gap-3 border-b pb-2 text-xs sm:grid">
              <span>자산</span>
              <span className="text-right">보유</span>
              <span className="text-right">평가액</span>
              <span className="text-right">현재%</span>
              <span className="text-right">리밸런싱</span>
              <span />
            </div>

            {stockRows.length > 0 && (
              <>
                <GroupHeader
                  label="주식"
                  totalValue={groupTotal(stockRows, 'valueInDisplay')}
                  totalRatio={stockRows.reduce((s, r) => s + r.currentRatio, 0)}
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

            {cashRows.length > 0 && (
              <>
                <GroupHeader
                  label="현금"
                  totalValue={groupTotal(cashRows, 'valueInDisplay')}
                  totalRatio={cashRows.reduce((s, r) => s + r.currentRatio, 0)}
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
  )
}
