import { db } from '@/shared/api/db'
import type { Currency } from '@/shared/lib/currency'
import type { Asset } from '../model/types'

export const assetRepo = {
  list: () => db.assets.orderBy('createdAt').toArray(),
  get: (id: number) => db.assets.get(id),
  create: (input: Omit<Asset, 'id' | 'createdAt'>) =>
    db.assets.add({ ...input, createdAt: Date.now() }),
  update: (id: number, patch: Partial<Asset>) => db.assets.update(id, patch),
  remove: (id: number) =>
    db.transaction(
      'rw',
      [
        db.assets,
        db.transactions,
        db.priceSnapshots,
        db.assetHoldings,
        db.assetTargets,
      ],
      async () => {
        await db.transactions.where('assetId').equals(id).delete()
        await db.priceSnapshots.where('assetId').equals(id).delete()
        await db.assetHoldings.delete(id)
        await db.assetTargets.delete(id)
        await db.assets.delete(id)
      },
    ),
  ensureCashAsset: async (currency: Currency = 'USD'): Promise<number> => {
    const existing = await db.assets.where('type').equals('cash').first()
    if (existing?.id !== undefined) return existing.id
    const id = await db.assets.add({
      type: 'cash',
      symbol: currency,
      name: '현금',
      currency,
      createdAt: Date.now(),
    })
    return Number(id)
  },
}
