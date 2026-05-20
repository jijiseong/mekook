import { db } from '@/shared/api/db'
import type { AssetCategory } from '../model/types'

export const categoryTargetRepo = {
  list: () => db.categoryTargets.toArray(),
  get: (category: AssetCategory) => db.categoryTargets.get(category),
  setAll: (entries: { category: AssetCategory; ratio: number }[]) => {
    const now = Date.now()
    return db.categoryTargets.bulkPut(
      entries.map((e) => ({ ...e, updatedAt: now })),
    )
  },
}
