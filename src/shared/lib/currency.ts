export type Currency = 'USD'

export interface CurrencyMeta {
  value: Currency
  label: string
  symbol: string
}

export const CURRENCIES: readonly CurrencyMeta[] = [
  { value: 'USD', label: '달러', symbol: '$' },
] as const

export const DEFAULT_CURRENCY: Currency = 'USD'
