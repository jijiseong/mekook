import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/shared/api/db'

export const useAssetHoldings = () =>
  useLiveQuery(() => db.assetHoldings.toArray(), [], [])
