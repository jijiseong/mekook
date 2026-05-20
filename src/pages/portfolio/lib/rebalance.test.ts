import { describe, it, expect } from 'vitest'
import type { Asset } from '@/entities/asset'
import { computeRebalance, type RebalanceRow } from './rebalance'

function stock(id: number, symbol: string, currency = 'USD'): Asset {
  return {
    id,
    type: 'stock',
    symbol,
    name: symbol,
    currency,
    createdAt: 0,
  }
}

function cash(id: number, currency: 'KRW' | 'USD' = 'KRW'): Asset {
  return {
    id,
    type: 'cash',
    symbol: currency,
    name: '현금',
    currency,
    createdAt: 0,
  }
}

function row(rows: RebalanceRow[], i: number): RebalanceRow {
  const r = rows[i]
  if (!r) throw new Error(`행 ${i} 없음`)
  return r
}

describe('computeRebalance', () => {
  it('단일 종목, 환산 없음, 정확히 비례 분배', () => {
    const result = computeRebalance([
      {
        asset: stock(1, 'AAPL'),
        holding: { assetId: 1, quantity: 10, price: 200, updatedAt: 0 },
        livePrice: 200,
        target: 1,
        fxRate: 1,
      },
    ])
    expect(result.totalValueInDisplay).toBe(2000)
    expect(row(result.rows, 0).deltaInDisplay).toBe(0)
    expect(row(result.rows, 0).deltaQty).toBe(0)
  })

  it('주식 + 현금, 목표 비중에 따른 차이 계산', () => {
    const result = computeRebalance([
      {
        asset: stock(1, 'AAPL'),
        holding: { assetId: 1, quantity: 10, price: 200, updatedAt: 0 },
        livePrice: 200,
        target: 0.7,
        fxRate: 1,
      },
      {
        asset: cash(2, 'USD'),
        holding: { assetId: 2, quantity: 1000, price: 1, updatedAt: 0 },
        livePrice: undefined,
        target: 0.3,
        fxRate: 1,
      },
    ])
    expect(result.totalValueInDisplay).toBe(3000)
    expect(row(result.rows, 0).targetValueInDisplay).toBe(2100)
    expect(row(result.rows, 0).deltaInDisplay).toBe(100)
    expect(row(result.rows, 0).deltaQty).toBeCloseTo(0.5, 5)
    expect(row(result.rows, 1).targetValueInDisplay).toBe(900)
    expect(row(result.rows, 1).deltaInDisplay).toBe(-100)
    expect(row(result.rows, 1).deltaQty).toBeNull()
  })

  it('통화 환산: KRW 현금을 USD로 환산', () => {
    const result = computeRebalance([
      {
        asset: stock(1, 'TSLA'),
        holding: { assetId: 1, quantity: 5, price: 400, updatedAt: 0 },
        livePrice: 400,
        target: 0.5,
        fxRate: 1,
      },
      {
        asset: cash(2, 'KRW'),
        holding: {
          assetId: 2,
          quantity: 2_700_000,
          price: 1,
          updatedAt: 0,
        },
        livePrice: undefined,
        target: 0.5,
        fxRate: 1 / 1350,
      },
    ])
    expect(result.totalValueInDisplay).toBeCloseTo(4000, 0)
    expect(row(result.rows, 0).deltaInDisplay).toBeCloseTo(0, 0)
  })

  it('빈 포트폴리오: 총액 0이면 currentRatio도 0', () => {
    const result = computeRebalance([])
    expect(result.totalValueInDisplay).toBe(0)
    expect(result.rows).toEqual([])
  })

  it('FX 미준비: valueInDisplay/delta undefined', () => {
    const result = computeRebalance([
      {
        asset: stock(1, 'AAPL'),
        holding: { assetId: 1, quantity: 10, price: 200, updatedAt: 0 },
        livePrice: 200,
        target: 1,
        fxRate: undefined,
      },
    ])
    expect(row(result.rows, 0).valueInDisplay).toBeUndefined()
    expect(row(result.rows, 0).deltaInDisplay).toBeUndefined()
    expect(row(result.rows, 0).deltaQty).toBeNull()
  })

  it('목표 비율 합 추적', () => {
    const result = computeRebalance([
      {
        asset: stock(1, 'A'),
        holding: undefined,
        livePrice: 100,
        target: 0.4,
        fxRate: 1,
      },
      {
        asset: stock(2, 'B'),
        holding: undefined,
        livePrice: 100,
        target: 0.5,
        fxRate: 1,
      },
    ])
    expect(result.targetRatioSum).toBeCloseTo(0.9, 5)
  })
})
