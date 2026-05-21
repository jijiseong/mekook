import { useEffect, useId } from 'react'
import { Trash2 } from 'lucide-react'
import { assetRepo } from '@/entities/asset'
import { assetHoldingRepo } from '@/entities/asset-holding'
import { ConfirmButton } from '@/shared/ui/confirm-button'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/shared/ui/input-group'
import { Label } from '@/shared/ui/label'
import { type Currency } from '@/shared/lib/currency'
import type { RebalanceRow } from '../lib/rebalance'
import { formatMoney } from '../lib/format'

interface Props {
  row: RebalanceRow
  displayCurrency: Currency
  color?: string
}

export function AssetInputRow({ row, displayCurrency, color }: Props) {
  const { asset, holding, livePrice, effectivePrice } = row
  const isStock = asset.type === 'stock'
  const isCash = asset.type === 'cash'
  const assetCurrency: Currency =
    asset.currency === 'USD' ? asset.currency : displayCurrency

  const qty = holding?.quantity ?? 0
  const storedPrice = holding?.price ?? 0

  useEffect(() => {
    if (!isStock || livePrice === undefined || asset.id === undefined) return
    if (livePrice === storedPrice) return
    void assetHoldingRepo.setPrice(asset.id, livePrice)
  }, [isStock, livePrice, storedPrice, asset.id])

  const saveQuantity = (next: number) => {
    if (asset.id === undefined) return
    if (next === qty) return
    void assetHoldingRepo.upsert({
      assetId: asset.id,
      quantity: next,
      price: isStock ? effectivePrice : 1,
    })
  }

  const remove = () => {
    if (asset.id === undefined) return
    void assetRepo.remove(asset.id)
  }

  const inputId = useId()

  if (isCash) {
    return (
      <div className="grid grid-cols-[1fr_auto] items-center gap-3">
        <Label htmlFor={inputId} className="font-medium">
          현금 ({asset.currency})
        </Label>
        <InputGroup className="w-32">
          <InputGroupInput
            id={inputId}
            key={`c-${asset.id}-${assetCurrency}-${qty}`}
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            defaultValue={qty || ''}
            placeholder="0"
            onBlur={(e) => saveQuantity(Number(e.target.value) || 0)}
            aria-label="현금 금액"
          />
          <InputGroupAddon align="inline-end">{asset.currency}</InputGroupAddon>
        </InputGroup>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-[1fr_auto_auto] items-center gap-2">
      <Label htmlFor={inputId} className="flex items-center gap-2">
        {color && (
          <span
            aria-hidden
            className="size-3 shrink-0 rounded-sm"
            style={{ backgroundColor: color }}
          />
        )}
        <span className="flex min-w-0 flex-col">
          <span className="truncate">{asset.name || asset.symbol}</span>
          {asset.name && (
            <span className="text-muted-foreground truncate text-xs">
              {asset.symbol}
            </span>
          )}
        </span>
      </Label>
      <div className="flex items-center gap-2">
        <InputGroup className="w-32">
          <InputGroupInput
            id={inputId}
            key={`q-${qty}`}
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            defaultValue={qty || ''}
            placeholder="0"
            onBlur={(e) => saveQuantity(Number(e.target.value) || 0)}
            aria-label="수량"
          />
          <InputGroupAddon align="inline-end">주</InputGroupAddon>
        </InputGroup>
        <span className="text-muted-foreground text-xs whitespace-nowrap">
          @ {formatMoney(effectivePrice, assetCurrency)}
        </span>
      </div>
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
