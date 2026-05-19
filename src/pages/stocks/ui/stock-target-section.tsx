import { useId, useMemo, useState } from 'react'
import { useAssets } from '@/entities/asset'
import type { Asset } from '@/entities/asset'
import { assetTargetRepo, useAssetTargets } from '@/entities/asset-target'
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
import { StockAllocationPie } from './stock-allocation-pie'

function colorFor(index: number) {
  const hue = (index * 47) % 360
  return `oklch(0.72 0.18 ${hue})`
}

export function StockTargetSection() {
  const assets = useAssets()
  const stocks = useMemo(
    () => (assets ?? []).filter((a) => a.type === 'stock'),
    [assets],
  )
  const stored = useAssetTargets()
  const storedRatios = useMemo(() => {
    if (stocks.length === 0) return []
    if (!stored || stored.length === 0) {
      return stocks.map(() => 1 / stocks.length)
    }
    const byId = new Map(stored.map((s) => [s.assetId, s.ratio]))
    return stocks.map((s) => (s.id ? (byId.get(s.id) ?? 0) : 0))
  }, [stocks, stored])

  const [draft, setDraft] = useState<number[] | null>(null)
  const ratios = draft ?? storedRatios

  const sumPct = ratios.reduce((a, b) => a + b, 0) * 100
  const isBalanced = stocks.length === 0 || Math.abs(sumPct - 100) < 0.05

  const updateOne = (index: number, raw: string) => {
    const parsed = Number(raw)
    const pct = Number.isFinite(parsed) ? Math.max(0, parsed) : 0
    const next = [...ratios]
    next[index] = pct / 100
    setDraft(next)
  }

  const commit = () => {
    if (!draft) return
    const entries: { assetId: number; ratio: number }[] = []
    stocks.forEach((s, i) => {
      if (s.id !== undefined) {
        entries.push({ assetId: s.id, ratio: draft[i] ?? 0 })
      }
    })
    void assetTargetRepo.setAll(entries)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>목표 포트폴리오 비율</CardTitle>
        <CardDescription>
          개별 종목의 목표 비중을 입력하세요. 합계는 100%가 되어야 합니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {stocks.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            아래에서 종목을 추가하면 목표 비율을 설정할 수 있습니다.
          </p>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="flex flex-col gap-3">
              {stocks.map((stock, i) => (
                <AllocationRow
                  key={stock.id}
                  stock={stock}
                  color={colorFor(i)}
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
              <StockAllocationPie
                items={stocks.map((s, i) => ({
                  id: s.id ?? i,
                  label: s.name || s.symbol,
                  ratio: ratios[i] ?? 0,
                  color: colorFor(i),
                }))}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface RowProps {
  stock: Asset
  color: string
  value: number
  onChange: (raw: string) => void
  onBlur: () => void
}

function AllocationRow({ stock, color, value, onChange, onBlur }: RowProps) {
  const id = useId()
  const display = (value * 100).toFixed(1).replace(/\.0$/, '')

  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-3">
      <Label htmlFor={id} className="flex items-center gap-2">
        <span
          aria-hidden
          className="size-3 rounded-sm"
          style={{ backgroundColor: color }}
        />
        <span className="flex flex-col">
          <span>{stock.name || stock.symbol}</span>
          {stock.name && (
            <span className="text-muted-foreground text-xs">
              {stock.symbol}
            </span>
          )}
        </span>
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
