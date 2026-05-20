import type { Asset } from '@/entities/asset'
import type { AssetTarget } from '@/entities/asset-target'
import type { CategoryTarget } from '@/entities/category-target'

export function effectiveTargetRatio(
  asset: Asset,
  assetTargets: AssetTarget[],
  categoryTargets: CategoryTarget[],
): number {
  if (asset.type === 'stock') {
    const catRatio =
      categoryTargets.find((c) => c.category === 'stock')?.ratio ?? 0
    const sub = assetTargets.find((t) => t.assetId === asset.id)?.ratio ?? 0
    return catRatio * sub
  }
  if (asset.type === 'cash') {
    return categoryTargets.find((c) => c.category === 'cash')?.ratio ?? 0
  }
  return 0
}
