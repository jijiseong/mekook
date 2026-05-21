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
import { formatSignedMoney } from '../lib/format'
import type { RebalanceRow as RebalanceRowData } from '../lib/rebalance'
import { RebalanceRow } from './rebalance-row'

function groupDelta(rows: RebalanceRowData[]): number | undefined {
  if (rows.some((r) => r.deltaInDisplay === undefined)) return undefined
  return rows.reduce((s, r) => s + (r.deltaInDisplay ?? 0), 0)
}

interface GroupHeaderProps {
  label: string
  totalDelta: number | undefined
  displayCurrency: Currency
}

function GroupHeader({ label, totalDelta, displayCurrency }: GroupHeaderProps) {
  const deltaColor =
    totalDelta === undefined || Math.abs(totalDelta) < 0.5
      ? 'text-muted-foreground'
      : totalDelta > 0
        ? 'text-emerald-600'
        : 'text-rose-600'

  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-3 border-b py-2 sm:grid-cols-[2fr_1.6fr]">
      <span className="text-sm font-semibold">{label}</span>
      <span
        className={cn('hidden tabular-nums sm:block sm:text-right', deltaColor)}
      >
        {totalDelta === undefined
          ? '—'
          : Math.abs(totalDelta) < 0.5
            ? '균형'
            : formatSignedMoney(totalDelta, displayCurrency)}
      </span>
    </div>
  )
}

export function RebalanceSection() {
  const { displayCurrency, rows, stockRows, cashRows, isBalanced } =
    usePortfolioData()

  return (
    <Card>
      <CardHeader>
        <CardTitle>리밸런싱</CardTitle>
        <CardDescription>
          목표 비중에 맞추기 위해 매수/매도해야 할 금액입니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="text-muted-foreground text-sm">자산이 없습니다.</p>
        ) : !isBalanced ? (
          <p className="text-muted-foreground text-sm">
            목표 비중 합계가 100%가 되어야 리밸런싱 금액이 표시됩니다.
          </p>
        ) : (
          <div className="flex flex-col">
            <div className="text-muted-foreground hidden grid-cols-[2fr_1.6fr] items-center gap-3 border-b pb-2 text-xs sm:grid">
              <span>자산</span>
              <span className="text-right">리밸런싱</span>
            </div>

            {stockRows.length > 0 && (
              <>
                <GroupHeader
                  label="주식"
                  totalDelta={groupDelta(stockRows)}
                  displayCurrency={displayCurrency}
                />
                {stockRows.map((row) => (
                  <RebalanceRow
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
                  totalDelta={groupDelta(cashRows)}
                  displayCurrency={displayCurrency}
                />
                {cashRows.map((row) => (
                  <RebalanceRow
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
