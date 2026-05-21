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
      label: row.asset.name,
      ratio: row.target,
      color: getAssetColor(key, allKeys),
    }
  })

  const currentItems: AllocationPieItem[] = rows.map((row) => {
    const key = row.asset.symbol || row.asset.name
    return {
      id: row.asset.id ?? key,
      label: row.asset.name,
      ratio: row.currentRatio,
      color: getAssetColor(key, allKeys),
    }
  })

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col items-center gap-1 text-center mb-8">
        <h2 className="text-xl font-semibold">현재 vs 목표</h2>
      </div>
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="flex flex-col items-center gap-3">
            <p className="text-muted-foreground text-sm font-medium">현재</p>
            <AllocationPie items={currentItems} />
          </div>
          <div className="flex flex-col items-center gap-3">
            <p className="text-muted-foreground text-sm font-medium">목표</p>
            <AllocationPie items={targetItems} />
          </div>
          <div className="flex flex-col items-center gap-3">
            <p className="text-muted-foreground text-sm font-medium">
              현재 vs 목표
            </p>
            <PortfolioChart rows={rows} />
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5">
          {allKeys.map((key) => (
            <div key={key} className="flex items-center gap-1.5 text-xs">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-sm"
                style={{ backgroundColor: getAssetColor(key, allKeys) }}
              />
              <span className="text-muted-foreground">{key}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
