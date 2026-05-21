import { Label } from '@/shared/ui/label'
import { type Currency } from '@/shared/lib/currency'
import { cn } from '@/shared/lib/utils'
import type { RebalanceRow as RebalanceRowData } from '../lib/rebalance'
import { formatSignedMoney } from '../lib/format'

interface Props {
  row: RebalanceRowData
  displayCurrency: Currency
  color?: string
}

export function RebalanceRow({ row, displayCurrency, color }: Props) {
  const { asset } = row
  const isStock = asset.type === 'stock'
  const isCash = asset.type === 'cash'

  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-2">
      <Label className="flex items-center gap-2">
        {color && (
          <span
            aria-hidden
            className="size-3 shrink-0 rounded-sm"
            style={{ backgroundColor: color }}
          />
        )}
        <span className="flex min-w-0 flex-col">
          <span className="truncate">{asset.name || asset.symbol}</span>
          {isStock && asset.name && (
            <span className="text-muted-foreground truncate text-xs">
              {asset.symbol}
            </span>
          )}
        </span>
      </Label>
      <div className="tabular-nums text-right">
        {row.deltaInDisplay === undefined ? (
          <span className="text-muted-foreground">—</span>
        ) : Math.abs(row.deltaInDisplay) < 0.5 ? (
          <span className="text-muted-foreground">균형</span>
        ) : (
          <div className="flex flex-col items-end">
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
