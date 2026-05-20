import type { Currency } from '@/shared/lib/currency'

export interface ConvertInput {
  amount: number
  from: Currency
  to: Currency
  rate: number
}

export function convertAmount({
  amount,
  from,
  to,
  rate,
}: ConvertInput): number {
  if (from === to) return amount
  return amount * rate
}
