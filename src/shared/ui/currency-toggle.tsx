import { useId } from 'react'
import { useCurrency } from '@/shared/lib/currency-context'
import { Label } from '@/shared/ui/label'
import { Switch } from '@/shared/ui/switch'
import { cn } from '@/shared/lib/utils'

export function CurrencyToggle() {
  const { currency, setCurrency } = useCurrency()
  const id = useId()
  const isKrw = currency === 'KRW'

  return (
    <div className="flex items-center gap-2">
      <Label
        htmlFor={id}
        className={cn(
          'text-sm font-medium transition-colors',
          isKrw ? 'text-muted-foreground' : 'text-foreground',
        )}
      >
        달러
      </Label>
      <Switch
        id={id}
        checked={isKrw}
        onCheckedChange={(checked) => setCurrency(checked ? 'KRW' : 'USD')}
        aria-label="통화 전환"
      />
      <Label
        htmlFor={id}
        className={cn(
          'text-sm font-medium transition-colors',
          isKrw ? 'text-foreground' : 'text-muted-foreground',
        )}
      >
        원
      </Label>
    </div>
  )
}
