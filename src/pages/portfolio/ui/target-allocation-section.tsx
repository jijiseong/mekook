import { useId, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { useAssets, assetRepo } from '@/entities/asset'
import type { Asset } from '@/entities/asset'
import { assetTargetRepo, useAssetTargets } from '@/entities/asset-target'
import {
  categoryTargetRepo,
  useCategoryTargets,
} from '@/entities/category-target'
import type { AssetCategory } from '@/entities/category-target'
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
import { ConfirmButton } from '@/shared/ui/confirm-button'
import { cn } from '@/shared/lib/utils'
import { getAssetColor } from '@/shared/lib/asset-color'
import { AllocationPie } from './allocation-pie'
import { AddAssetDialog } from './add-asset-dialog'

interface DraftState {
  stockCat: number // 0–1 fraction
  cashCat: number // 0–1 fraction
  subs: number[] // per-stock within-category fractions, parallel to stocks
}

export function TargetAllocationSection() {
  const assets = useAssets()
  const assetTargets = useAssetTargets()
  const categoryTargets = useCategoryTargets()

  const stocks = assets.filter((a) => a.type === 'stock')
  const cashAsset = assets.find((a) => a.type === 'cash')

  const subByAsset = new Map(assetTargets.map((t) => [t.assetId, t.ratio]))
  const storedStockCat =
    categoryTargets.find((c) => c.category === 'stock')?.ratio ?? 1
  const storedCashCat =
    categoryTargets.find((c) => c.category === 'cash')?.ratio ?? 0
  const storedSubs = stocks.map((s) =>
    s.id !== undefined ? (subByAsset.get(s.id) ?? 0) : 0,
  )

  const [draft, setDraft] = useState<DraftState | null>(null)

  const stockCat =
    draft?.subs?.length === stocks.length
      ? (draft?.stockCat ?? storedStockCat)
      : storedStockCat
  const cashCat =
    draft?.subs?.length === stocks.length
      ? (draft?.cashCat ?? storedCashCat)
      : storedCashCat
  const subs = draft?.subs?.length === stocks.length ? draft.subs : storedSubs

  const catSum = (stockCat + cashCat) * 100
  const catBalanced = Math.abs(catSum - 100) < 0.05

  const subSum = subs.reduce((a, b) => a + b, 0) * 100
  const subBalanced = stocks.length === 0 || Math.abs(subSum - 100) < 0.05

  const pieItems = [
    ...stocks.map((s, i) => ({
      id: s.id ?? i,
      label: s.name || s.symbol,
      ratio: stockCat * (subs[i] ?? 0),
      color: getAssetColor(s.symbol),
    })),
    ...(cashAsset
      ? [
          {
            id: cashAsset.id ?? 'cash',
            label: `현금 (${cashAsset.currency})`,
            ratio: cashCat,
            color: getAssetColor(cashAsset.currency),
          },
        ]
      : []),
  ]

  const updateCat = (category: AssetCategory, raw: string) => {
    const v = Math.max(0, Number.isFinite(Number(raw)) ? Number(raw) : 0) / 100
    const base = {
      stockCat,
      cashCat,
      subs,
    }
    setDraft(
      category === 'stock' ? { ...base, stockCat: v } : { ...base, cashCat: v },
    )
  }

  const updateSub = (i: number, raw: string) => {
    const v = Math.max(0, Number.isFinite(Number(raw)) ? Number(raw) : 0) / 100
    const nextSubs = [...subs]
    nextSubs[i] = v
    setDraft({ stockCat, cashCat, subs: nextSubs })
  }

  const commit = () => {
    if (!draft || draft.subs.length !== stocks.length) return
    void Promise.all([
      categoryTargetRepo.setAll([
        { category: 'stock', ratio: draft.stockCat },
        { category: 'cash', ratio: draft.cashCat },
      ]),
      assetTargetRepo.setAll(
        stocks.flatMap((s, i) =>
          s.id !== undefined
            ? [{ assetId: s.id, ratio: draft.subs[i] ?? 0 }]
            : [],
        ),
      ),
    ]).then(() => setDraft(null))
  }

  const hasAssets = stocks.length > 0 || !!cashAsset

  return (
    <Card>
      <CardHeader>
        <CardTitle>목표 포트폴리오 비율</CardTitle>
        <CardDescription>
          주식과 현금의 카테고리 비중을 설정하고, 종목별 세부 비중을 입력하세요.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!hasAssets ? (
          <p className="text-muted-foreground text-sm">
            종목을 추가하면 목표 비율을 설정할 수 있습니다.
          </p>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="flex flex-col gap-2">
              {/* 주식 카테고리 */}
              <CategoryRow
                label="주식"
                value={stockCat}
                onChange={(raw) => updateCat('stock', raw)}
                onBlur={commit}
              />
              <div className="ml-4 flex flex-col gap-2 border-l pl-4">
                {stocks.map((s, i) => (
                  <StockSubRow
                    key={s.id ?? s.symbol}
                    stock={s}
                    color={getAssetColor(s.symbol)}
                    value={subs[i] ?? 0}
                    onChange={(raw) => updateSub(i, raw)}
                    onBlur={commit}
                  />
                ))}
                <div className="pt-1">
                  <AddAssetDialog
                    existingSymbols={stocks.map((s) => s.symbol.toUpperCase())}
                  />
                </div>
                {stocks.length > 0 && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">자식 합계</span>
                    <span
                      className={cn(
                        'tabular-nums',
                        subBalanced
                          ? 'text-muted-foreground'
                          : 'text-amber-600',
                      )}
                    >
                      {subSum.toFixed(1)}%
                      {!subBalanced && (
                        <span className="ml-1">(100%가 아닙니다)</span>
                      )}
                    </span>
                  </div>
                )}
              </div>

              {/* 현금 카테고리 */}
              {cashAsset && (
                <CategoryRow
                  label={`현금 (${cashAsset.currency})`}
                  value={cashCat}
                  onChange={(raw) => updateCat('cash', raw)}
                  onBlur={commit}
                />
              )}

              {/* 합계 */}
              <div className="flex items-center justify-between border-t pt-3 text-sm">
                <span className="font-medium">합계</span>
                <span
                  className={cn(
                    'font-semibold tabular-nums',
                    catBalanced ? 'text-foreground' : 'text-destructive',
                  )}
                >
                  {catSum.toFixed(1)}%
                  {!catBalanced && (
                    <span className="ml-2 text-xs font-normal">
                      (100%가 아닙니다)
                    </span>
                  )}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <AllocationPie items={pieItems} />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface CategoryRowProps {
  label: string
  value: number // 0–1 fraction
  onChange: (raw: string) => void
  onBlur: () => void
}

function CategoryRow({ label, value, onChange, onBlur }: CategoryRowProps) {
  const id = useId()
  const display = (value * 100).toFixed(1).replace(/\.0$/, '')
  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-3">
      <Label htmlFor={id} className="font-medium">
        {label}
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

interface StockSubRowProps {
  stock: Asset
  color: string
  value: number // 0–1 fraction (within-category)
  onChange: (raw: string) => void
  onBlur: () => void
}

function StockSubRow({
  stock,
  color,
  value,
  onChange,
  onBlur,
}: StockSubRowProps) {
  const id = useId()
  const display = (value * 100).toFixed(1).replace(/\.0$/, '')

  const remove = () => {
    if (stock.id === undefined) return
    void assetRepo.remove(stock.id)
  }

  return (
    <div className="grid grid-cols-[1fr_auto_auto] items-center gap-2">
      <Label htmlFor={id} className="flex items-center gap-2">
        <span
          aria-hidden
          className="size-3 shrink-0 rounded-sm"
          style={{ backgroundColor: color }}
        />
        <span className="flex min-w-0 flex-col">
          <span className="truncate">{stock.name || stock.symbol}</span>
          {stock.name && (
            <span className="text-muted-foreground truncate text-xs">
              {stock.symbol}
            </span>
          )}
        </span>
      </Label>
      <InputGroup className="w-28">
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
      <ConfirmButton
        variant="ghost"
        size="icon"
        confirmVariant="destructive"
        title="종목 삭제"
        description="이 종목을 삭제하시겠습니까? 되돌릴 수 없습니다."
        confirmText="삭제"
        onConfirm={remove}
        aria-label="종목 삭제"
      >
        <Trash2 className="size-4" />
      </ConfirmButton>
    </div>
  )
}
