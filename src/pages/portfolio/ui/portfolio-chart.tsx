import { Cell, Pie, PieChart } from 'recharts'

import { getAssetColor } from '@/shared/lib/asset-color'
import { cn } from '@/shared/lib/utils'
import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from '@/shared/ui/chart'
import { formatRatio } from '../lib/format'
import type { RebalanceRow } from '../lib/rebalance'

interface Props {
  rows: RebalanceRow[]
}

const chartConfig = {} satisfies ChartConfig

const RADIAN = Math.PI / 180

function assetKey(row: RebalanceRow): string {
  return row.asset.symbol || row.asset.name
}

export function PortfolioChart({ rows }: Props) {
  if (rows.length === 0) return null

  const hasData = rows.some((r) => r.target > 0 || r.currentRatio > 0)
  if (!hasData) {
    return (
      <div className="text-muted-foreground flex h-[220px] w-full items-center justify-center text-xs">
        비율을 입력하세요
      </div>
    )
  }

  const allKeys = rows.map(assetKey)

  // 안쪽: 목표 비중 (기준)
  const innerData = rows.map((row) => ({
    name: assetKey(row),
    value: row.target * 100,
    color: getAssetColor(assetKey(row), allKeys),
  }))

  // 바깥: 현재 비중 (현재 보유 상태)
  const outerData = rows.map((row) => {
    const current = row.currentRatio * 100
    const target = row.target * 100
    return {
      name: assetKey(row),
      value: current,
      delta: current - target,
      color: getAssetColor(assetKey(row), allKeys),
    }
  })

  return (
    <ChartContainer config={chartConfig} className="h-[220px] w-full">
      <PieChart>
        {/* 안쪽: 목표 비중 */}
        <Pie
          data={innerData}
          dataKey="value"
          cx="50%"
          cy="50%"
          innerRadius={28}
          outerRadius={56}
          paddingAngle={2}
          stroke="none"
        >
          {innerData.map((d) => (
            <Cell key={d.name} fill={d.color} fillOpacity={0.4} />
          ))}
        </Pie>

        {/* 바깥: 현재 비중 */}
        <Pie
          data={outerData}
          dataKey="value"
          cx="50%"
          cy="50%"
          innerRadius={62}
          outerRadius={90}
          paddingAngle={2}
          stroke="none"
          labelLine={false}
          label={({ cx, cy, midAngle, outerRadius, payload }) => {
            const ncx = typeof cx === 'number' ? cx : 0
            const ncy = typeof cy === 'number' ? cy : 0
            const nMid = typeof midAngle === 'number' ? midAngle : 0
            const nr = typeof outerRadius === 'number' ? outerRadius : 0
            const delta =
              payload !== null &&
              typeof payload === 'object' &&
              'delta' in payload &&
              typeof payload.delta === 'number'
                ? payload.delta
                : 0
            if (Math.abs(delta) < 0.5) return null
            const radius = nr + 10
            const x = ncx + radius * Math.cos(-nMid * RADIAN)
            const y = ncy + radius * Math.sin(-nMid * RADIAN)
            return (
              <text
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={10}
                fill={delta > 0 ? '#16a34a' : '#e11d48'}
              >
                {delta > 0 ? '+' : ''}
                {formatRatio(delta / 100)}
              </text>
            )
          }}
        >
          {outerData.map((d) => (
            <Cell key={d.name} fill={d.color} />
          ))}
        </Pie>

        <ChartTooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null
            const item = payload[0]
            if (!item) return null
            const name = typeof item.name === 'string' ? item.name : ''
            const row = rows.find((r) => assetKey(r) === name)
            if (!row) return null
            const current = row.currentRatio * 100
            const target = row.target * 100
            const delta = current - target
            return (
              <div className="grid min-w-36 gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl">
                <div className="flex items-center gap-1.5 font-medium">
                  <span
                    className="h-2 w-2 shrink-0 rounded-sm"
                    style={{ backgroundColor: getAssetColor(name, allKeys) }}
                  />
                  {name}
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">현재</span>
                  <span className="font-mono font-medium tabular-nums">
                    {current.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">목표</span>
                  <span className="font-mono font-medium tabular-nums">
                    {target.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">차이</span>
                  <span
                    className={cn(
                      'font-mono font-medium tabular-nums',
                      delta > 0
                        ? 'text-emerald-600'
                        : delta < 0
                          ? 'text-rose-600'
                          : 'text-muted-foreground',
                    )}
                  >
                    {delta > 0 ? '+' : ''}
                    {formatRatio(delta / 100)}
                  </span>
                </div>
              </div>
            )
          }}
        />
      </PieChart>
    </ChartContainer>
  )
}
