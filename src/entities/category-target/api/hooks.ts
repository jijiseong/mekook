import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/shared/api/db'

export const useCategoryTargets = () =>
  useLiveQuery(() => db.categoryTargets.toArray(), [], [])
