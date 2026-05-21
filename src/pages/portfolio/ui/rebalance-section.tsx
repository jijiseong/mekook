import { Label } from '@/shared/ui/label'
import { getAssetColor } from '@/shared/lib/asset-color'
import { usePortfolioData } from '../lib/use-portfolio-data'
import { RebalanceRow } from './rebalance-row'

export function RebalanceSection() {
  const { displayCurrency, rows, stockRows, cashRows, isBalanced } =
    usePortfolioData()

  const actionableRows = stockRows.filter(
    (r) => r.deltaInDisplay !== undefined && Math.abs(r.deltaInDisplay) >= 0.5,
  )

  const allIds = [
    ...stockRows.map((r) => r.asset.symbol),
    ...cashRows.map((r) => r.asset.currency),
  ]

  const renderBody = () => {
    if (rows.length === 0) {
      return <p className="text-muted-foreground text-sm">자산이 없습니다.</p>
    }
    if (!isBalanced) {
      return (
        <p className="text-muted-foreground text-sm">
          목표 비중 합계가 100%가 되어야 리밸런싱 금액이 표시됩니다.
        </p>
      )
    }
    if (actionableRows.length === 0) {
      return (
        <p className="text-muted-foreground text-sm">
          취해야 할 액션이 없습니다.
        </p>
      )
    }
    return (
      <div className="ml-4 flex flex-col gap-2 border-l pl-4">
        {actionableRows.map((row) => (
          <RebalanceRow
            key={row.asset.id ?? row.asset.symbol}
            row={row}
            displayCurrency={displayCurrency}
            color={getAssetColor(row.asset.symbol, allIds)}
          />
        ))}
      </div>
    )
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="mb-8 flex flex-col items-center gap-1 text-center">
        <h2 className="text-xl font-semibold">리밸런싱</h2>
        <p className="text-muted-foreground text-sm">
          목표 비중에 맞추기 위해 매수/매도해야 할 금액입니다.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <div className="grid grid-cols-[1fr_auto] items-center gap-3">
          <Label className="font-medium">주식</Label>
        </div>
        {renderBody()}
      </div>
    </section>
  )
}
