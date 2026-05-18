import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/shared/api/db'

export const useAssets = () =>
  useLiveQuery(() => db.assets.orderBy('createdAt').toArray(), [], [])

export const useAsset = (id: number | undefined) =>
  useLiveQuery(() => (id ? db.assets.get(id) : undefined), [id])
