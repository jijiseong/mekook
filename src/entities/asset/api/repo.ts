import { db } from '@/shared/api/db'
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
      db.assets,
      db.transactions,
      db.priceSnapshots,
      async () => {
        await db.transactions.where('assetId').equals(id).delete()
        await db.priceSnapshots.where('assetId').equals(id).delete()
        await db.assets.delete(id)
      },
    ),
}
