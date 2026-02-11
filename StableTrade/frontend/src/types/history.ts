export type TxAction = 'buy' | 'sell' | 'claim' | 'burn' | 'mint'

export interface TxHistoryItem {
  id: string
  digest: string
  time: number
  network: string
  brandKey: string
  action: TxAction
  status: 'success' | 'error'
  amount?: string
  error?: string
}

export interface PendingOrderItem {
  digest: string
  time: number
  network: string
  brandKey: string
  amount: string
  brandCoinType: string
}
