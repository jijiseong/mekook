import { Pie, PieChart, Cell, Tooltip } from 'recharts'

export interface AllocationPieItem {
  id: number | string
  label: string
  ratio: number
  color: string
}

interface Props {
  items: AllocationPieItem[]
}

export function AllocationPie({ items }: Props) {
  const data = items
    .filter((i) => i.ratio > 0)
    .map((i) => ({ name: i.label, value: i.ratio, color: i.color }))

  if (data.length === 0) {
    return (
      <div className="text-muted-foreground flex h-[200px] w-[200px] items-center justify-center text-xs">
        비율을 입력하세요
      </div>
    )
  }

  return (
    <PieChart width={220} height={220}>
      <Pie
        data={data}
        dataKey="value"
        nameKey="name"
        cx="50%"
        cy="50%"
        innerRadius={50}
        outerRadius={90}
        stroke="none"
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
  )
}
