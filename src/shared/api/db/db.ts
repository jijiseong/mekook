import Dexie, { type EntityTable } from 'dexie'
import type { Asset } from '@/entities/asset'
import type { Transaction } from '@/entities/transaction'
import type { PriceSnapshot } from '@/entities/price-snapshot'
import type { AssetSummary } from '@/entities/asset-summary'

// FSD: shared가 entities를 import하는 것은 엄격한 레이어 규칙 위반이지만,
// 단일 Dexie 인스턴스에 모든 테이블 스키마를 모아야 하므로 실용적으로 허용.
export class MekookDB extends Dexie {
  // Dexie가 version().stores() 호출 시 런타임에 주입하는 테이블 핸들.
  // `declare`로 타입 힌트만 제공 (`!` definite-assignment 회피).
  declare assets: EntityTable<Asset, 'id'>
  declare transactions: EntityTable<Transaction, 'id'>
  declare priceSnapshots: EntityTable<PriceSnapshot, 'id'>
  declare assetSummaries: EntityTable<AssetSummary, 'type'>

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
  }
}

export const db = new MekookDB()
