import { useState, useCallback } from 'react'
import { useSignAndExecuteTransaction } from '@mysten/dapp-kit'
import { Transaction } from '@mysten/sui/transactions'
import type { SuiClient } from '@mysten/sui/client'

export type TxState = 'idle' | 'building' | 'signing' | 'executing' | 'success' | 'error'

export interface TxResult {
  digest?: string
  error?: string
}

export function useTransaction() {
  const { mutateAsync, isPending } = useSignAndExecuteTransaction()
  const [state, setState] = useState<TxState>('idle')
  const [result, setResult] = useState<TxResult>({})

  const execute = useCallback(async (buildTx: () => Promise<Transaction>) => {
    try {
      setState('building')
      setResult({})

      const tx = await buildTx()

      setState('signing')
      const { digest } = await mutateAsync({
        transactionBlock: tx
      })

      setState('executing')

      setState('success')
      setResult({ digest })

      return true
    } catch (error) {
      console.error('Transaction failed:', error)
      setState('error')
      setResult({
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      return false
    }
  }, [mutateAsync])

  const reset = useCallback(() => {
    setState('idle')
    setResult({})
  }, [])

  return {
    state,
    result,
    isLoading: state === 'building' || state === 'signing' || state === 'executing' || isPending,
    execute,
    reset
  }
}
