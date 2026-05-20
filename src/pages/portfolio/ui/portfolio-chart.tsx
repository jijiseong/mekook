import { Cell, Pie, PieChart } from 'recharts'

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

const PALETTE = [
  'var(--color-chart-1)',
  'var(--color-chart-2)',
  'var(--color-chart-3)',
  'var(--color-chart-4)',
  'var(--color-chart-5)',
]

const chartConfig = {} satisfies ChartConfig

const RADIAN = Math.PI / 180

export function PortfolioChart({ rows }: Props) {
  if (rows.length === 0) return null

  const innerData = rows.map((row, i) => ({
    name: row.asset.symbol || row.asset.name,
    value: row.currentRatio * 100,
    color: PALETTE[i % PALETTE.length],
  }))

  const outerData = rows.map((row, i) => {
    const current = row.currentRatio * 100
    const target = row.target * 100
    return {
      name: row.asset.symbol || row.asset.name,
      value: target,
      delta: target - current,
      current,
      color: PALETTE[i % PALETTE.length],
    }
  })

  return (
    <div className="flex flex-col items-center gap-2">
      <ChartContainer config={chartConfig} className="h-72 w-full max-w-sm">
        <PieChart>
          {/* 안쪽: 현재 비중 */}
          <Pie
            data={innerData}
            dataKey="value"
            cx="50%"
            cy="50%"
            innerRadius={52}
            outerRadius={82}
            paddingAngle={2}
            stroke="none"
          >
            {innerData.map((d, i) => (
              <Cell key={i} fill={d.color} />
            ))}
          </Pie>

          {/* 바깥: 목표 비중 */}
          <Pie
            data={outerData}
            dataKey="value"
            cx="50%"
            cy="50%"
            innerRadius={86}
            outerRadius={110}
            paddingAngle={2}
            stroke="none"
            labelLine={false}
            label={({ cx, cy, midAngle, outerRadius, payload }) => {
              const ncx = typeof cx === 'number' ? cx : 0
              const ncy = typeof cy === 'number' ? cy : 0
              const nMid = typeof midAngle === 'number' ? midAngle : 0
              const nr = typeof outerRadius === 'number' ? outerRadius : 0
              const p = payload as Record<string, unknown>
              const delta = typeof p?.delta === 'number' ? p.delta : 0
              if (Math.abs(delta) < 0.5) return null
              const radius = nr + 16
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
            {outerData.map((d, i) => (
              <Cell key={i} fill={d.color} fillOpacity={0.4} />
            ))}
          </Pie>

          <ChartTooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              const item = payload[0]
              if (!item) return null
              const name = typeof item.name === 'string' ? item.name : ''
              const row = rows.find(
                (r) => (r.asset.symbol || r.asset.name) === name,
              )
              if (!row) return null
              const current = row.currentRatio * 100
              const target = row.target * 100
              const delta = target - current
              return (
                <div className="grid min-w-36 gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl">
                  <div className="font-medium">{name}</div>
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

      <div className="flex items-center gap-6 text-xs text-muted-foreground">
        <span>안쪽 — 현재</span>
        <span className="opacity-50">바깥 — 목표</span>
      </div>
    </div>
  )
}
