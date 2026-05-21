import { LabelList, Pie, PieChart, ResponsiveContainer } from 'recharts'

export interface TargetAllocationItem {
  label: string
  value: number
  color: string
}

interface Props {
  items: TargetAllocationItem[]
}

export function TargetAllocationChart({ items }: Props) {
  const data = items
    .filter((i) => i.value > 0)
    .map((i) => ({
      name: `${i.label} ${(i.value * 100).toFixed(1)}%`,
      value: i.value,
      fill: i.color,
    }))

  if (data.length === 0) {
    return (
      <div className="text-muted-foreground flex aspect-square w-full max-w-sm items-center justify-center text-xs">
        항목이 없습니다
      </div>
    )
  }

  return (
    <div className="aspect-square w-full max-w-sm">
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            startAngle={90}
            endAngle={-270}
            innerRadius="32%"
            outerRadius="52%"
            paddingAngle={2}
          >
            <LabelList
              dataKey="name"
              position="outside"
              className="fill-foreground text-[11px]"
            />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
