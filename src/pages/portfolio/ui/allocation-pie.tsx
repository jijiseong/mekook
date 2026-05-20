import { Pie, PieChart, Cell, Tooltip } from 'recharts'
import { ChartContainer, type ChartConfig } from '@/shared/ui/chart'

export interface AllocationPieItem {
  id: number | string
  label: string
  ratio: number
  color: string
}

interface Props {
  items: AllocationPieItem[]
  showLabels?: boolean
}

const chartConfig = {} satisfies ChartConfig

export function AllocationPie({ items, showLabels = false }: Props) {
  const data = items
    .filter((i) => i.ratio > 0)
    .map((i) => ({ name: i.label, value: i.ratio, color: i.color }))

  if (data.length === 0) {
    return (
      <div className="text-muted-foreground flex h-[220px] w-full items-center justify-center text-xs">
        비율을 입력하세요
      </div>
    )
  }

  return (
    <ChartContainer config={chartConfig} className="h-[220px] w-full">
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={90}
          paddingAngle={3}
          stroke="none"
          label={
            showLabels
              ? (props) => {
                  const pct =
                    typeof props.value === 'number' ? props.value * 100 : 0
                  return pct >= 3 ? `${pct.toFixed(0)}%` : ''
                }
              : undefined
          }
          labelLine={showLabels}
        >
          {data.map((d) => (
            <Cell key={d.name} fill={d.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => {
            const num = typeof value === 'number' ? value : Number(value)
            return Number.isFinite(num) ? `${(num * 100).toFixed(1)}%` : ''
          }}
        />
      </PieChart>
    </ChartContainer>
  )
}
