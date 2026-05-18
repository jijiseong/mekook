import { db } from '@/shared/api/db'
import type { PriceSnapshot } from '../model/types'

export const priceSnapshotRepo = {
  latestByAsset: (assetId: number) =>
    db.priceSnapshots
      .where({ assetId })
      .reverse()
      .sortBy('capturedAt')
      .then((rows) => rows[0]),
  create: (input: Omit<PriceSnapshot, 'id'>) => db.priceSnapshots.add(input),
}
