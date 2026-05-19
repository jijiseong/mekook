import { db } from '@/shared/api/db'
import type { AssetType } from '@/entities/asset'

export const targetAllocationRepo = {
  list: () => db.targetAllocations.toArray(),
  setAll: (entries: { type: AssetType; ratio: number }[]) => {
    const now = Date.now()
    return db.targetAllocations.bulkPut(
      entries.map((e) => ({ ...e, updatedAt: now })),
    )
  },
}
