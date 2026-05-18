export type TransactionKind =
  | 'buy'
  | 'sell'
  | 'deposit'
  | 'withdraw'
  | 'dividend'
  | 'fee'

export interface Transaction {
  id?: number
  assetId: number
  kind: TransactionKind
  quantity: number
  price: number
  fee: number
  executedAt: number
  memo?: string
}
