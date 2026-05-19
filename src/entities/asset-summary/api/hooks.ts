import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/shared/api/db'
import type { AssetType } from '@/entities/asset'

export const useAssetSummary = (type: AssetType) =>
  useLiveQuery(() => db.assetSummaries.get(type), [type])
