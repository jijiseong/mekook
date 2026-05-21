import { CURRENCIES, type Currency } from '@/shared/lib/currency'

export function currencySymbol(currency: Currency): string {
  return CURRENCIES.find((c) => c.value === currency)?.symbol ?? ''
}

export function formatMoney(amount: number, currency: Currency): string {
  const sym = currencySymbol(currency)
  return `${sym}${amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
}

export function formatSignedMoney(amount: number, currency: Currency): string {
  const sign = amount > 0 ? '+' : amount < 0 ? '-' : ''
  return `${sign}${formatMoney(Math.abs(amount), currency)}`
}

export function formatRatio(ratio: number): string {
  return `${(ratio * 100).toFixed(1).replace(/\.0$/, '')}%`
}
