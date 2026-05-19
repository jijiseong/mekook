import { db } from '@/shared/api/db'

export const assetTargetRepo = {
  list: () => db.assetTargets.toArray(),
  setAll: (entries: { assetId: number; ratio: number }[]) => {
    const now = Date.now()
    return db.assetTargets.bulkPut(
      entries.map((e) => ({ ...e, updatedAt: now })),
    )
  },
  remove: (assetId: number) => db.assetTargets.delete(assetId),
}
