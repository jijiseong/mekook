import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card'
import { usePortfolioData } from '../lib/use-portfolio-data'
import { AssetInputRow } from './asset-input-row'

export function AssetInputSection() {
  const { displayCurrency, rows, stockRows, cashRows } = usePortfolioData()

  return (
    <Card>
      <CardHeader>
        <CardTitle>자산 입력</CardTitle>
        <CardDescription>
          보유 수량과 현금 금액을 입력하세요. 목표 비중은 위의 섹션에서
          설정합니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="text-muted-foreground text-sm">자산이 없습니다.</p>
        ) : (
          <div className="flex flex-col">
            <div className="text-muted-foreground hidden grid-cols-[2fr_1.4fr_auto] items-center gap-3 border-b pb-2 text-xs sm:grid">
              <span>자산</span>
              <span className="text-right">보유</span>
              <span />
            </div>

            {stockRows.length > 0 && (
              <>
                <div className="grid grid-cols-[2fr_1.4fr_auto] items-center gap-3 border-b py-2">
                  <span className="text-sm font-semibold">주식</span>
                  <span />
                  <span className="inline-block w-8" />
                </div>
                {stockRows.map((row) => (
                  <AssetInputRow
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
                <div className="grid grid-cols-[2fr_1.4fr_auto] items-center gap-3 border-b py-2">
                  <span className="text-sm font-semibold">현금</span>
                  <span />
                  <span className="inline-block w-8" />
                </div>
                {cashRows.map((row) => (
                  <AssetInputRow
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
