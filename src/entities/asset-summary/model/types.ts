import type { AssetType } from '@/entities/asset'
import type { Currency } from '@/shared/lib/currency'

export interface AssetSummary {
  type: AssetType
  amount: number
  currency: Currency
  updatedAt: number
}
