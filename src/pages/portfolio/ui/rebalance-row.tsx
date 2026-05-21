import { type Currency } from '@/shared/lib/currency'
import { cn } from '@/shared/lib/utils'
import type { RebalanceRow as RebalanceRowData } from '../lib/rebalance'
import { formatSignedMoney } from '../lib/format'

interface Props {
  row: RebalanceRowData
  displayCurrency: Currency
  indented?: boolean
}

export function RebalanceRow({ row, displayCurrency, indented }: Props) {
  const { asset } = row
  const isStock = asset.type === 'stock'
  const isCash = asset.type === 'cash'

  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-3 border-b py-3 last:border-b-0 sm:grid-cols-[2fr_1.6fr]">
      {/* 자산 */}
      <div className={cn('flex flex-col', indented && 'pl-4')}>
        <span className="font-medium">{asset.name || asset.symbol}</span>
        {isStock && asset.name && (
          <span className="text-muted-foreground text-xs">{asset.symbol}</span>
        )}
      </div>

      {/* 리밸런싱 */}
      <div className="tabular-nums sm:text-right">
        {row.deltaInDisplay === undefined ? (
          <span className="text-muted-foreground">—</span>
        ) : Math.abs(row.deltaInDisplay) < 0.5 ? (
          <span className="text-muted-foreground">균형</span>
        ) : (
          <div className="flex flex-col items-start sm:items-end">
            <span
              className={cn(
                'font-semibold',
                row.deltaInDisplay > 0 ? 'text-emerald-600' : 'text-rose-600',
              )}
            >
              {formatSignedMoney(row.deltaInDisplay, displayCurrency)}{' '}
              {isStock ? (row.deltaInDisplay > 0 ? '매수' : '매도') : null}
              {isCash && (row.deltaInDisplay > 0 ? ' 보충' : ' 줄이기')}
            </span>
            {isStock && row.deltaQty !== null && Math.abs(row.deltaQty) > 0 && (
              <span className="text-muted-foreground text-xs">
                ≈ {Math.abs(row.deltaQty).toFixed(2)}주
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
