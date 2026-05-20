import type { Currency } from '@/shared/lib/currency'

export interface FxRate {
  from: Currency
  to: Currency
  rate: number
  asOf: number
}
