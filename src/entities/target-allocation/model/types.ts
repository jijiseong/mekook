import type { AssetType } from '@/entities/asset'

export interface TargetAllocation {
  type: AssetType
  ratio: number
  updatedAt: number
}
