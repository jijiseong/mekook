import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

interface PieItem {
  id: number
  label: string
  ratio: number
  color: string
}

interface Props {
  items: PieItem[]
}

export function StockAllocationPie({ items }: Props) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={items}
          dataKey="ratio"
          nameKey="label"
          innerRadius={50}
          outerRadius={100}
          paddingAngle={1}
          stroke="hsl(var(--background))"
        >
          {items.map((d) => (
            <Cell key={d.id} fill={d.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value, name) => {
            const n = typeof value === 'number' ? value : 0
            const sum = items.reduce((a, b) => a + b.ratio, 0)
            const pct = sum > 0 ? (n / sum) * 100 : 0
            return [`${pct.toFixed(1)}%`, name]
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
