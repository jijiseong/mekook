import Dexie, { type EntityTable } from 'dexie'
import type { Asset } from '@/entities/asset'
import type { Transaction } from '@/entities/transaction'
import type { PriceSnapshot } from '@/entities/price-snapshot'
import type { AssetHolding } from '@/entities/asset-holding'
import type { AssetTarget } from '@/entities/asset-target'
import type {
  AssetCategory,
  CategoryTarget,
} from '@/entities/category-target/model/types'

// FSD: shared가 entities를 import하는 것은 엄격한 레이어 규칙 위반이지만,
// 단일 Dexie 인스턴스에 모든 테이블 스키마를 모아야 하므로 실용적으로 허용.
export class MekookDB extends Dexie {
  // Dexie가 version().stores() 호출 시 런타임에 주입하는 테이블 핸들.
  // `declare`로 타입 힌트만 제공 (`!` definite-assignment 회피).
  declare assets: EntityTable<Asset, 'id'>
  declare transactions: EntityTable<Transaction, 'id'>
  declare priceSnapshots: EntityTable<PriceSnapshot, 'id'>
  declare assetHoldings: EntityTable<AssetHolding, 'assetId'>
  declare assetTargets: EntityTable<AssetTarget, 'assetId'>
  declare categoryTargets: EntityTable<CategoryTarget, 'category'>

  constructor() {
    super('mekook')
    this.version(1).stores({
      assets: '++id, type, symbol, &[type+symbol], createdAt',
      transactions: '++id, assetId, kind, executedAt, [assetId+executedAt]',
      priceSnapshots: '++id, assetId, capturedAt, [assetId+capturedAt]',
    })
    this.version(2).stores({
      assetSummaries: 'type, updatedAt',
    })
    this.version(3).stores({
      targetAllocations: 'type, updatedAt',
    })
    this.version(4).stores({
      assetHoldings: 'assetId, updatedAt',
      assetTargets: 'assetId, updatedAt',
    })
    this.version(5).stores({
      assetSummaries: null,
      targetAllocations: null,
    })
    this.version(6)
      .stores({
        categoryTargets: 'category, updatedAt',
      })
      .upgrade(async (tx) => {
        await tx.table('assetTargets').clear()
        const now = Date.now()
        const seeds: {
          category: AssetCategory
          ratio: number
          updatedAt: number
        }[] = [
          { category: 'stock', ratio: 1, updatedAt: now },
          { category: 'cash', ratio: 0, updatedAt: now },
        ]
        await tx.table('categoryTargets').bulkPut(seeds)
      })
  }
}

export const db = new MekookDB()
