import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/shared/api/db'

export const useTransactionsByAsset = (assetId: number | undefined) =>
  useLiveQuery(
    () =>
      assetId ? db.transactions.where({ assetId }).sortBy('executedAt') : [],
    [assetId],
    [],
  )
