import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card'
import { usePortfolioData } from '../lib/use-portfolio-data'
import { RebalanceRow } from './rebalance-row'

export function RebalanceSection() {
  const { displayCurrency, rows, stockRows, isBalanced } = usePortfolioData()

  const actionableRows = stockRows.filter(
    (r) => r.deltaInDisplay !== undefined && Math.abs(r.deltaInDisplay) >= 0.5,
  )

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
        ) : actionableRows.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            취해야 할 액션이 없습니다.
          </p>
        ) : (
          <div className="flex flex-col">
            {actionableRows.map((row) => (
              <RebalanceRow
                key={row.asset.id ?? row.asset.symbol}
                row={row}
                displayCurrency={displayCurrency}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
