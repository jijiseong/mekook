import { useId, useMemo, useState } from 'react'
import {
  ASSET_TYPES,
  type AssetType,
  type AssetTypeMeta,
} from '@/entities/asset'
import {
  targetAllocationRepo,
  useTargetAllocations,
} from '@/entities/target-allocation'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/shared/ui/input-group'
import { Label } from '@/shared/ui/label'
import { cn } from '@/shared/lib/utils'
import { AllocationPie } from './allocation-pie'

const ASSET_COLORS: Record<AssetType, string> = {
  stock: 'oklch(0.7 0.18 250)',
  etf: 'oklch(0.72 0.18 150)',
  crypto: 'oklch(0.72 0.18 50)',
  bond: 'oklch(0.68 0.18 300)',
  cash: 'oklch(0.72 0.15 200)',
  other: 'oklch(0.65 0.04 280)',
}

export function TargetAllocationSection() {
  const stored = useTargetAllocations()
  const storedRatios = useMemo(() => {
    if (!stored || stored.length === 0) {
      return ASSET_TYPES.map(() => 1 / ASSET_TYPES.length)
    }
    const byType = new Map(stored.map((s) => [s.type, s.ratio]))
    return ASSET_TYPES.map((t) => byType.get(t.value) ?? 0)
  }, [stored])

  const [draft, setDraft] = useState<number[] | null>(null)
  const ratios = draft ?? storedRatios

  const sumPct = ratios.reduce((a, b) => a + b, 0) * 100
  const isBalanced = Math.abs(sumPct - 100) < 0.05

  const updateOne = (index: number, raw: string) => {
    const parsed = Number(raw)
    const pct = Number.isFinite(parsed) ? Math.max(0, parsed) : 0
    const next = [...ratios]
    next[index] = pct / 100
    setDraft(next)
  }

  const commit = () => {
    if (!draft) return
    void targetAllocationRepo.setAll(
      ASSET_TYPES.map((t, i) => ({ type: t.value, ratio: draft[i] ?? 0 })),
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>목표 포트폴리오 비율</CardTitle>
        <CardDescription>
          자산 종류별 목표 비중을 입력하세요. 합계는 100%가 되어야 합니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-3">
            {ASSET_TYPES.map((type, i) => (
              <AllocationRow
                key={type.value}
                type={type}
                value={ratios[i] ?? 0}
                onChange={(raw) => updateOne(i, raw)}
                onBlur={commit}
              />
            ))}
            <div className="flex items-center justify-between border-t pt-3 text-sm">
              <span className="font-medium">합계</span>
              <span
                className={cn(
                  'font-semibold tabular-nums',
                  isBalanced ? 'text-foreground' : 'text-destructive',
                )}
              >
                {sumPct.toFixed(1)}%
                {!isBalanced && (
                  <span className="ml-2 text-xs font-normal">
                    (100%가 아닙니다)
                  </span>
                )}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <AllocationPie ratios={ratios} colors={ASSET_COLORS} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface RowProps {
  type: AssetTypeMeta
  value: number
  onChange: (raw: string) => void
  onBlur: () => void
}

function AllocationRow({ type, value, onChange, onBlur }: RowProps) {
  const id = useId()
  const display = (value * 100).toFixed(1).replace(/\.0$/, '')

  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-3">
      <Label htmlFor={id} className="flex items-center gap-2">
        <span
          aria-hidden
          className="size-3 rounded-sm"
          style={{ backgroundColor: ASSET_COLORS[type.value] }}
        />
        {type.label}
      </Label>
      <InputGroup className="w-32">
        <InputGroupInput
          id={id}
          type="number"
          inputMode="decimal"
          min="0"
          step="0.1"
          value={display}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
        />
        <InputGroupAddon align="inline-end">%</InputGroupAddon>
      </InputGroup>
    </div>
  )
}
