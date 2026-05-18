import { Input } from './input'
import { cn } from '@/shared/lib/utils'
import { CURRENCIES, type Currency } from '@/shared/lib/currency'

interface MoneyInputProps {
  value: string
  currency: Currency
  onValueChange: (value: string) => void
  onCurrencyChange: (currency: Currency) => void
  placeholder?: string
  className?: string
}

export function MoneyInput({
  value,
  currency,
  onValueChange,
  onCurrencyChange,
  placeholder = '0',
  className,
}: MoneyInputProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Input
        type="number"
        inputMode="decimal"
        min="0"
        step="any"
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1"
      />
      <div
        role="radiogroup"
        aria-label="통화 선택"
        className="inline-flex rounded-lg border border-input p-0.5"
      >
        {CURRENCIES.map((c) => {
          const selected = currency === c.value
          return (
            <button
              key={c.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onCurrencyChange(c.value)}
              className={cn(
                'rounded-md px-2 py-1 text-xs font-medium transition-colors',
                selected
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {c.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
