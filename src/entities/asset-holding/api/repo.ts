import { db } from '@/shared/api/db'

export const assetHoldingRepo = {
  list: () => db.assetHoldings.toArray(),
  get: (assetId: number) => db.assetHoldings.get(assetId),
  upsert: (input: { assetId: number; quantity: number; price: number }) =>
    db.assetHoldings.put({ ...input, updatedAt: Date.now() }),
  setPrice: (assetId: number, price: number) =>
    db.assetHoldings.update(assetId, { price, updatedAt: Date.now() }),
  remove: (assetId: number) => db.assetHoldings.delete(assetId),
}
