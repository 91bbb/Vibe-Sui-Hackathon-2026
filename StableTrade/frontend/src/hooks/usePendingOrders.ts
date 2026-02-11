import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PendingOrderItem } from '../types/history'

interface PendingOrdersState {
  pendings: PendingOrderItem[]
  addPending: (item: PendingOrderItem) => void
  removePending: (digest: string) => void
}

export function usePendingOrders() {
  return usePendingOrdersStore()
}

export const usePendingOrdersStore = create<PendingOrdersState>()(
  persist(
    (set) => ({
      pendings: [],
      addPending: (item) =>
        set((state) => ({
          pendings: [item, ...state.pendings].slice(0, 20)
        })),
      removePending: (digest) =>
        set((state) => ({
          pendings: state.pendings.filter((p) => p.digest !== digest)
        }))
    }),
    {
      name: 'stabletrade-pending-orders'
    }
  )
)
