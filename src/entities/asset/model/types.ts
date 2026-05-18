export type AssetType = 'stock' | 'crypto' | 'cash' | 'bond' | 'etf' | 'other'

export interface AssetTypeMeta {
  value: AssetType
  label: string
  description: string
}

export const ASSET_TYPES: readonly AssetTypeMeta[] = [
  { value: 'stock', label: '주식', description: '국내·해외 상장 주식' },
  { value: 'etf', label: 'ETF', description: '상장지수펀드' },
  {
    value: 'crypto',
    label: '암호화폐',
    description: 'BTC, ETH 등 디지털 자산',
  },
  { value: 'bond', label: '채권', description: '국채·회사채' },
  { value: 'cash', label: '현금', description: '예금·외화 현금' },
  { value: 'other', label: '기타', description: '분류되지 않은 자산' },
] as const

export interface Asset {
  id?: number
  type: AssetType
  symbol: string
  name: string
  currency: string
  createdAt: number
}
