import { useId, useMemo, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { assetRepo, useAssets } from '@/entities/asset'
import type { Asset } from '@/entities/asset'
import { assetHoldingRepo, useAssetHoldings } from '@/entities/asset-holding'
import { assetTargetRepo } from '@/entities/asset-target'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/shared/ui/input-group'
import { Label } from '@/shared/ui/label'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog'
import { CURRENCIES } from '@/shared/lib/currency'
import { useCurrency } from '@/shared/lib/currency-context'

export function StockHoldingsSection() {
  const { currency } = useCurrency()
  const symbol = CURRENCIES.find((c) => c.value === currency)?.symbol ?? ''

  const assets = useAssets()
  const stocks = useMemo(
    () => (assets ?? []).filter((a) => a.type === 'stock'),
    [assets],
  )
  const holdings = useAssetHoldings()
  const holdingByAsset = useMemo(() => {
    const m = new Map<number, { quantity: number; price: number }>()
    ;(holdings ?? []).forEach((h) =>
      m.set(h.assetId, { quantity: h.quantity, price: h.price }),
    )
    return m
  }, [holdings])

  const total = useMemo(() => {
    return stocks.reduce((sum, s) => {
      if (s.id === undefined) return sum
      const h = holdingByAsset.get(s.id)
      if (!h) return sum
      return sum + h.quantity * h.price
    }, 0)
  }, [stocks, holdingByAsset])

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>보유 종목</CardTitle>
          <CardDescription>
            종목을 추가하고 보유 수량 및 주가를 입력하면 자산이 계산됩니다.
          </CardDescription>
        </div>
        <AddStockDialog existingSymbols={stocks.map((s) => s.symbol)} />
      </CardHeader>
      <CardContent>
        {stocks.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            아직 추가된 종목이 없습니다.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              {stocks.map((stock) => (
                <HoldingRow
                  key={stock.id}
                  stock={stock}
                  holding={
                    stock.id !== undefined
                      ? holdingByAsset.get(stock.id)
                      : undefined
                  }
                  currencySymbol={symbol}
                />
              ))}
            </div>
            <div className="flex items-center justify-between border-t pt-3 text-sm">
              <span className="font-medium">총 자산</span>
              <span className="font-semibold tabular-nums">
                {symbol}
                {total.toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface HoldingRowProps {
  stock: Asset
  holding: { quantity: number; price: number } | undefined
  currencySymbol: string
}

function HoldingRow({ stock, holding, currencySymbol }: HoldingRowProps) {
  const qtyId = useId()
  const priceId = useId()
  const quantity = holding?.quantity ?? 0
  const price = holding?.price ?? 0
  const value = quantity * price

  const save = (next: { quantity?: number; price?: number }) => {
    if (stock.id === undefined) return
    const q = next.quantity ?? quantity
    const p = next.price ?? price
    if (q === quantity && p === price) return
    void assetHoldingRepo.upsert({
      assetId: stock.id,
      quantity: q,
      price: p,
    })
  }

  const remove = () => {
    if (stock.id === undefined) return
    void (async () => {
      const id = stock.id
      if (id === undefined) return
      await assetHoldingRepo.remove(id)
      await assetTargetRepo.remove(id)
      await assetRepo.remove(id)
    })()
  }

  return (
    <div className="grid grid-cols-1 items-end gap-3 border-b pb-3 last:border-b-0 last:pb-0 sm:grid-cols-[1fr_auto_auto_auto_auto]">
      <div className="flex flex-col">
        <span className="font-medium">{stock.name || stock.symbol}</span>
        {stock.name && (
          <span className="text-muted-foreground text-xs">{stock.symbol}</span>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor={qtyId} className="text-muted-foreground text-xs">
          수량
        </Label>
        <Input
          id={qtyId}
          key={`q-${quantity}`}
          type="number"
          inputMode="decimal"
          min="0"
          step="any"
          defaultValue={quantity || ''}
          placeholder="0"
          className="w-28"
          onBlur={(e) => save({ quantity: Number(e.target.value) || 0 })}
        />
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor={priceId} className="text-muted-foreground text-xs">
          주가
        </Label>
        <InputGroup className="w-32">
          <InputGroupInput
            id={priceId}
            key={`p-${price}`}
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            defaultValue={price || ''}
            placeholder="0"
            onBlur={(e) => save({ price: Number(e.target.value) || 0 })}
          />
          <InputGroupAddon align="inline-end">{currencySymbol}</InputGroupAddon>
        </InputGroup>
      </div>
      <div className="flex flex-col gap-1 sm:items-end">
        <span className="text-muted-foreground text-xs">자산</span>
        <span className="font-semibold tabular-nums">
          {currencySymbol}
          {value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
        </span>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={remove}
        aria-label="종목 삭제"
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  )
}

interface AddStockDialogProps {
  existingSymbols: string[]
}

function AddStockDialog({ existingSymbols }: AddStockDialogProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const { currency } = useCurrency()

  const reset = () => {
    setQuery('')
    setName('')
    setError(null)
  }

  const submit = () => {
    const symbol = query.trim().toUpperCase()
    if (!symbol) {
      setError('종목 코드를 입력하세요.')
      return
    }
    if (existingSymbols.map((s) => s.toUpperCase()).includes(symbol)) {
      setError('이미 추가된 종목입니다.')
      return
    }
    void (async () => {
      await assetRepo.create({
        type: 'stock',
        symbol,
        name: name.trim() || symbol,
        currency,
      })
      reset()
      setOpen(false)
    })()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) reset()
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="size-4" />
          추가
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>종목 추가</DialogTitle>
          <DialogDescription>종목 코드와 이름을 입력하세요.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="stock-symbol">종목 코드</Label>
            <Input
              id="stock-symbol"
              placeholder="예: AAPL, 005930"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setError(null)
              }}
              autoFocus
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="stock-name">이름 (선택)</Label>
            <Input
              id="stock-name"
              placeholder="예: Apple Inc."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          {error && (
            <p className="text-destructive text-sm" role="alert">
              {error}
            </p>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">취소</Button>
          </DialogClose>
          <Button onClick={submit}>추가</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
