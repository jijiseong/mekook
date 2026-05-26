import { Pie, PieChart, Cell, Tooltip, LabelList } from 'recharts'
import { ChartContainer, type ChartConfig } from '@/shared/ui/chart'

export interface AllocationPieItem {
  id: number | string
  label: string
  ratio: number
  color: string
}

interface Props {
  items: AllocationPieItem[]
  hatched?: boolean
}

const chartConfig = {} satisfies ChartConfig

export function AllocationPie({ items, hatched = false }: Props) {
  const data = items
    .filter((i) => i.ratio > 0)
    .map((i) => {
      const pct = `${(i.ratio * 100).toFixed(1).replace(/\.0$/, '')}%`
      return {
        name: i.label,
        value: i.ratio,
        color: i.color,
        displayLabel: `${i.label} ${pct}`,
      }
    })

  if (data.length === 0) {
    return (
      <div className="text-muted-foreground flex h-[220px] w-full items-center justify-center text-xs">
        비율을 입력하세요
      </div>
    )
  }

  return (
    <ChartContainer
      config={chartConfig}
      className="h-[220px] w-full [&_svg]:overflow-visible"
    >
      <PieChart>
        {hatched && (
          <defs>
            {data.map((d) => (
              <pattern
                key={d.name}
                id={`hatch-${d.name}`}
                patternUnits="userSpaceOnUse"
                width={6}
                height={6}
                patternTransform="rotate(45)"
              >
                <line
                  x1={0}
                  y1={0}
                  x2={0}
                  y2={6}
                  stroke={d.color}
                  strokeWidth={10}
                  strokeOpacity={1}
                />
              </pattern>
            ))}
          </defs>
        )}
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={28}
          outerRadius={90}
          paddingAngle={2}
          stroke="none"
          labelLine={false}
        >
          {data.map((d) => (
            <Cell
              key={d.name}
              fill={hatched ? `url(#hatch-${d.name})` : d.color}
            />
          ))}
          <LabelList
            dataKey="displayLabel"
            position="outside"
            className="fill-foreground text-[11px]"
          />
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
