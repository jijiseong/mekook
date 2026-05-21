import { useEffect, useId } from 'react'
import { Trash2 } from 'lucide-react'
import { assetRepo } from '@/entities/asset'
import { assetHoldingRepo } from '@/entities/asset-holding'
import { ConfirmButton } from '@/shared/ui/confirm-button'
import { Input } from '@/shared/ui/input'
import { type Currency } from '@/shared/lib/currency'
import { cn } from '@/shared/lib/utils'
import type { RebalanceRow } from '../lib/rebalance'
import { formatMoney } from '../lib/format'

interface Props {
  row: RebalanceRow
  displayCurrency: Currency
  indented?: boolean
}

export function AssetInputRow({ row, displayCurrency, indented }: Props) {
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

  const qtyId = useId()
  const cashId = useId()

  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-3 border-b py-3 last:border-b-0 sm:grid-cols-[2fr_1.4fr_auto]">
      {/* 자산 */}
      <div className={cn('flex flex-col', indented && 'pl-4')}>
        <span className="font-medium">{asset.name || asset.symbol}</span>
        {isStock && asset.name && (
          <span className="text-muted-foreground text-xs">{asset.symbol}</span>
        )}
      </div>

      {/* 보유 */}
      <div className="sm:text-right">
        {isStock ? (
          <div className="flex items-center justify-start gap-2 sm:justify-end">
            <Input
              id={qtyId}
              key={`q-${qty}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              defaultValue={qty || ''}
              placeholder="0"
              className="w-24"
              onBlur={(e) => saveQuantity(Number(e.target.value) || 0)}
              aria-label="수량"
            />
            <span className="text-muted-foreground text-xs whitespace-nowrap">
              @ {formatMoney(effectivePrice, assetCurrency)}
            </span>
          </div>
        ) : isCash ? (
          <div className="flex items-center justify-start gap-2 sm:justify-end">
            <Input
              id={cashId}
              key={`c-${asset.id}-${assetCurrency}-${qty}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              defaultValue={qty || ''}
              placeholder="0"
              className="w-32"
              onBlur={(e) => saveQuantity(Number(e.target.value) || 0)}
              aria-label="현금 금액"
            />
          </div>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </div>

      {/* 삭제 (종목만) */}
      <div className="flex justify-end">
        {isStock ? (
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
        ) : (
          <span className="inline-block w-8" />
        )}
      </div>
    </div>
  )
}
