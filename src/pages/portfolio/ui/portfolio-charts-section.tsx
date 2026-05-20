import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { getAssetColor } from '@/shared/lib/asset-color'
import { usePortfolioData } from '../lib/use-portfolio-data'
import { AllocationPie, type AllocationPieItem } from './allocation-pie'
import { PortfolioChart } from './portfolio-chart'

export function PortfolioChartsSection() {
  const { rows } = usePortfolioData()

  if (rows.length === 0) return null

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>현재 vs 목표</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="flex flex-col items-center gap-3">
            <p className="text-muted-foreground text-sm font-medium">목표</p>
            <AllocationPie items={targetItems} showLabels />
          </div>
          <div className="flex flex-col items-center gap-3">
            <p className="text-muted-foreground text-sm font-medium">현재</p>
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
  )
}
