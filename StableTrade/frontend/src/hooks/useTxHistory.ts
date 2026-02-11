import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { TxHistoryItem } from '../types/history'

interface TxHistoryState {
  history: TxHistoryItem[]
  addTx: (item: TxHistoryItem) => void
  clearHistory: () => void
}

export function useTxHistory() {
  return useTxHistoryStore()
}

export const useTxHistoryStore = create<TxHistoryState>()(
  persist(
    (set) => ({
      history: [],
      addTx: (item) =>
        set((state) => ({
          history: [item, ...state.history].slice(0, 50)
        })),
      clearHistory: () => set({ history: [] })
    }),
    {
      name: 'stabletrade-tx-history'
    }
  )
)

export function createSuccessTx(params: {
  digest: string
  network: string
  brandKey: string
  action: 'buy' | 'sell' | 'claim'
  amount?: string
}): TxHistoryItem {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    digest: params.digest,
    time: Date.now(),
    network: params.network,
    brandKey: params.brandKey,
    action: params.action,
    status: 'success',
    amount: params.amount
  }
}
