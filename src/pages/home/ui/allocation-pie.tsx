import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { ASSET_TYPES, type AssetType } from '@/entities/asset'

interface Props {
  ratios: number[]
  colors: Record<AssetType, string>
}

export function AllocationPie({ ratios, colors }: Props) {
  const data = ASSET_TYPES.map((t, i) => ({
    type: t.value,
    label: t.label,
    ratio: ratios[i] ?? 0,
    color: colors[t.value],
  }))

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          dataKey="ratio"
          nameKey="label"
          innerRadius={50}
          outerRadius={100}
          paddingAngle={1}
          stroke="hsl(var(--background))"
        >
          {data.map((d) => (
            <Cell key={d.type} fill={d.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value, name) => {
            const n = typeof value === 'number' ? value : 0
            const sum = ratios.reduce((a, b) => a + b, 0)
            const pct = sum > 0 ? (n / sum) * 100 : 0
            return [`${pct.toFixed(1)}%`, name]
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
