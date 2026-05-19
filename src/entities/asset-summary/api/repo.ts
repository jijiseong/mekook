import { db } from '@/shared/api/db'
import type { AssetType } from '@/entities/asset'
import type { Currency } from '@/shared/lib/currency'

export const assetSummaryRepo = {
  get: (type: AssetType) => db.assetSummaries.get(type),
  upsert: (input: { type: AssetType; amount: number; currency: Currency }) =>
    db.assetSummaries.put({ ...input, updatedAt: Date.now() }),
}
