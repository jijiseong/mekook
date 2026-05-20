import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from 'recharts'
import type { LabelProps } from 'recharts'

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  type ChartConfig,
} from '@/shared/ui/chart'
import { formatRatio } from '../lib/format'
import type { RebalanceRow } from '../lib/rebalance'

interface Props {
  rows: RebalanceRow[]
}

const chartConfig = {
  current: { label: '현재', color: 'var(--color-chart-2)' },
  target: { label: '목표', color: 'var(--color-chart-1)' },
} satisfies ChartConfig

type ChartDatum = {
  name: string
  current: number
  target: number
  currentLabel: number | null
  targetLabel: number | null
}

function DeltaLabel({ x, y, width, value }: LabelProps) {
  const nx = typeof x === 'number' ? x : 0
  const ny = typeof y === 'number' ? y : 0
  const nw = typeof width === 'number' ? width : 0
  const delta = typeof value === 'number' ? value : null
  if (delta === null || Math.abs(delta) < 0.1) return null
  return (
    <text
      x={nx + nw / 2}
      y={ny - 4}
      textAnchor="middle"
      fontSize={10}
      fill={delta > 0 ? '#16a34a' : '#e11d48'}
    >
      {delta > 0 ? '+' : ''}
      {formatRatio(delta / 100)}
    </text>
  )
}

export function PortfolioChart({ rows }: Props) {
  if (rows.length === 0) return null

  const data: ChartDatum[] = rows.map((row) => {
    const current = row.currentRatio * 100
    const target = row.target * 100
    const delta = target - current
    return {
      name: row.asset.symbol || row.asset.name,
      current,
      target,
      currentLabel: current > target ? delta : null,
      targetLabel: target >= current ? delta : null,
    }
  })

  return (
    <ChartContainer config={chartConfig} className="h-64">
      <BarChart data={data} barGap={2} barCategoryGap="30%">
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="name"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11 }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11 }}
          tickFormatter={(v: number) => `${v}%`}
          width={36}
        />
        <ChartTooltip
          content={({ active, payload, label }) => {
            if (!active || !payload?.length) return null
            const visible = payload.filter(
              (p) => p.dataKey === 'current' || p.dataKey === 'target',
            )
            return (
              <div className="grid min-w-32 gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl">
                <div className="font-medium">{label}</div>
                {visible.map((p) => {
                  const val = typeof p.value === 'number' ? p.value : 0
                  const name = p.dataKey === 'current' ? '현재' : '목표'
                  return (
                    <div
                      key={String(p.dataKey)}
                      className="flex justify-between gap-4"
                    >
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <span
                          className="h-2 w-2 shrink-0 rounded-sm"
                          style={{ backgroundColor: p.color }}
                        />
                        {name}
                      </span>
                      <span className="font-mono font-medium tabular-nums">
                        {val.toFixed(1)}%
                      </span>
                    </div>
                  )
                })}
              </div>
            )
          }}
        />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar
          dataKey="current"
          fill="var(--color-current)"
          radius={[3, 3, 0, 0]}
          maxBarSize={24}
        >
          <LabelList dataKey="currentLabel" content={DeltaLabel} />
        </Bar>
        <Bar
          dataKey="target"
          fill="var(--color-target)"
          radius={[3, 3, 0, 0]}
          maxBarSize={24}
        >
          <LabelList dataKey="targetLabel" content={DeltaLabel} />
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}
