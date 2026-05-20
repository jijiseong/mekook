export type AssetCategory = 'stock' | 'cash'

export interface CategoryTarget {
  category: AssetCategory
  ratio: number // 0–1 fraction (e.g., 0.7 = 70%)
  updatedAt: number
}
