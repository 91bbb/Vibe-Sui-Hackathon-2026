import { useMemo } from 'react'
import type { StepConfig, StepKey } from '../components/GuidedStepper'
import type { TxHistoryItem } from '../types/history'
import type { PendingOrderItem } from '../types/history'

interface UseGuidedFlowParams {
  usdcBalance: string
  brandBalance: string
  history: TxHistoryItem[]
  pendings: PendingOrderItem[]
}

export function useGuidedFlow({
  usdcBalance,
  brandBalance,
  history,
  pendings
}: UseGuidedFlowParams) {
  const steps = useMemo<StepConfig[]>(() => {
    const hasBought = history.some((h) => h.action === 'buy' && h.status === 'success')
    const hasSold = history.some((h) => h.action === 'sell' && h.status === 'success')
    const hasClaimed = history.some((h) => h.action === 'claim' && h.status === 'success')

    const usdcBalanceNum = parseFloat(usdcBalance) || 0

    const buyStatus: StepConfig['status'] = hasBought
      ? 'done'
      : usdcBalanceNum > 0
      ? 'current'
      : 'pending'

    const sellStatus: StepConfig['status'] = hasSold
      ? 'done'
      : hasBought
      ? 'current'
      : hasBought
      ? 'pending'
      : 'locked'

    const claimStatus: StepConfig['status'] = hasClaimed
      ? 'done'
      : hasSold
      ? 'current'
      : hasSold
      ? 'pending'
      : 'locked'

    return [
      {
        key: 'buy',
        title: 'Buy',
        subtitle: 'Purchase virtual goods with USDC',
        status: buyStatus,
        icon: '🛒',
        disabledReason: buyStatus !== 'current' ? '需要先完成 Buy 操作' : undefined
      },
      {
        key: 'sell',
        title: 'Sell',
        subtitle: 'Sell virtual goods back to USDC',
        status: sellStatus,
        icon: '💰',
        disabledReason: sellStatus === 'locked' ? '先完成 Buy 操作' : undefined
      },
      {
        key: 'claim',
        title: 'Claim',
        subtitle: 'Claim trading rewards',
        status: claimStatus,
        icon: '🎁',
        disabledReason: claimStatus === 'locked' ? '先完成 Sell 操作' : undefined
      }
    ]
  }, [usdcBalance, brandBalance, history, pendings])

  const currentStepKey = useMemo<StepKey>(() => {
    const currentStep = steps.find((s) => s.status === 'current')
    return currentStep?.key || 'buy'
  }, [steps])

  const setCurrentStepKey = (key: StepKey) => {
    console.log('Setting current step to:', key)
  }

  const goToStep = (key: StepKey) => {
    const step = steps.find((s) => s.key === key)
    if (step && step.status !== 'locked') {
      setCurrentStepKey(key)
    }
  }

  const onActionSuccess = (action: StepKey, extra?: { mode?: 't_plus_1' | 'instant' }) => {
    console.log('Action completed:', action, extra)
  }

  return {
    steps,
    currentStepKey,
    setCurrentStepKey,
    goToStep,
    onActionSuccess
  }
}
