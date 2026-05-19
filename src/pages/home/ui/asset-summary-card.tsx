import { useId } from 'react'
import { useAssetSummary, assetSummaryRepo } from '@/entities/asset-summary'
import type { AssetTypeMeta } from '@/entities/asset'
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
import { CURRENCIES } from '@/shared/lib/currency'
import { useCurrency } from '@/shared/lib/currency-context'

interface Props {
  type: AssetTypeMeta
}

export function AssetSummaryCard({ type }: Props) {
  const summary = useAssetSummary(type.value)
  const { currency } = useCurrency()
  const titleId = useId()
  const meta = CURRENCIES.find((c) => c.value === currency)

  const save = (raw: string) => {
    const next = Number(raw) || 0
    if (next === (summary?.amount ?? 0) && summary?.currency === currency) {
      return
    }
    void assetSummaryRepo.upsert({
      type: type.value,
      amount: next,
      currency,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle id={titleId}>{type.label}</CardTitle>
        <CardDescription>{type.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <InputGroup>
          <InputGroupInput
            key={summary?.amount ?? 0}
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            defaultValue={summary?.amount || ''}
            onBlur={(e) => save(e.target.value)}
            placeholder="0"
            aria-labelledby={titleId}
          />
          {meta && (
            <InputGroupAddon align="inline-end">{meta.symbol}</InputGroupAddon>
          )}
        </InputGroup>
      </CardContent>
    </Card>
  )
}
