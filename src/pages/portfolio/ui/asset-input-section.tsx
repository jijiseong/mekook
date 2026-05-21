import { Label } from '@/shared/ui/label'
import { getAssetColor } from '@/shared/lib/asset-color'
import { usePortfolioData } from '../lib/use-portfolio-data'
import { AssetInputRow } from './asset-input-row'

export function AssetInputSection() {
  const { displayCurrency, stockRows, cashRows } = usePortfolioData()

  const allIds = [
    ...stockRows.map((r) => r.asset.symbol),
    ...cashRows.map((r) => r.asset.currency),
  ]

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col items-center gap-1 text-center mb-8">
        <h2 className="text-xl font-semibold">자산 입력</h2>
        <p className="text-muted-foreground text-sm">
          보유 수량과 현금 금액을 입력하세요. 목표 비중은 위의 섹션에서
          설정합니다.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        {/* 주식 카테고리 */}
        <div className="grid grid-cols-[1fr_auto] items-center gap-3">
          <Label className="font-medium">주식</Label>
        </div>
        <div className="ml-4 flex flex-col gap-2 border-l pl-4">
          {stockRows.length === 0 ? (
            <p className="text-muted-foreground text-sm">종목이 없습니다.</p>
          ) : (
            stockRows.map((row) => (
              <AssetInputRow
                key={row.asset.id ?? row.asset.symbol}
                row={row}
                displayCurrency={displayCurrency}
                color={getAssetColor(row.asset.symbol, allIds)}
              />
            ))
          )}
        </div>

        {/* 현금 카테고리 */}
        {cashRows.map((row) => (
          <AssetInputRow
            key={row.asset.id ?? row.asset.symbol}
            row={row}
            displayCurrency={displayCurrency}
          />
        ))}
      </div>
    </section>
  )
}
