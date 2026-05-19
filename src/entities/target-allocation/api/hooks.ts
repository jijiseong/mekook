import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/shared/api/db'

export const useTargetAllocations = () =>
  useLiveQuery(() => db.targetAllocations.toArray(), [])
