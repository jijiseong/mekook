import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/shared/api/db'

export const useAssetTargets = () =>
  useLiveQuery(() => db.assetTargets.toArray(), [], [])
