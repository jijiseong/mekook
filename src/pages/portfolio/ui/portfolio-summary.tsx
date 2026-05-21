import { Card, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { cn } from '@/shared/lib/utils'
import { usePortfolioData } from '../lib/use-portfolio-data'
import { formatMoney, formatRatio } from '../lib/format'

export function PortfolioSummary() {
  const {
    displayCurrency,
    totalValueInDisplay,
    targetRatioSum,
    isBalanced,
    totalBuy,
    totalSell,
  } = usePortfolioData()

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <CardDescription>총 평가액</CardDescription>
          <CardTitle className="text-3xl font-semibold tabular-nums">
            {formatMoney(totalValueInDisplay, displayCurrency)}
          </CardTitle>
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
  )
}
