import { db } from '@/shared/api/db'
import type { Transaction } from '../model/types'

export const transactionRepo = {
  listByAsset: (assetId: number) =>
    db.transactions.where({ assetId }).sortBy('executedAt'),
  create: (input: Omit<Transaction, 'id'>) => db.transactions.add(input),
  update: (id: number, patch: Partial<Transaction>) =>
    db.transactions.update(id, patch),
  remove: (id: number) => db.transactions.delete(id),
}
