import { useState } from 'react'
import { Button, Chip } from '@heroui/react'
import { useAppStore } from '../lib/store'
import { buildClaimTx } from '../lib/stablelayer/adapter'
import { isBrandConfigured } from '../config/brands'
import { useTransaction } from '../hooks/useTransaction'
import { useTxHistory, createSuccessTx } from '../hooks/useTxHistory'
import { TxFeedbackCard } from './TxFeedbackCard'

interface ClaimTabProps {
  onSuccess?: () => void
}

export function ClaimTab({ onSuccess }: ClaimTabProps) {
  const suiClient = useAppStore((state) => state.suiClient)
  const address = useAppStore((state) => state.address)
  const network = useAppStore((state) => state.selectedNetwork)
  const brand = useAppStore((state) => state.selectedBrand)

  const { state, result, isLoading, execute, reset } = useTransaction()
  const { addTx } = useTxHistory()
  const [claimSupported, setClaimSupported] = useState(true)

  const handleClaim = async () => {
    if (!address) return

    try {
      const success = await execute(async () => {
        const { tx } = await buildClaimTx({
          suiClient,
          sender: address,
          brandCoinType: brand.coinType,
          network
        })

        return tx
      })

      if (success && result.digest) {
        addTx(createSuccessTx({
          digest: result.digest,
          network,
          brandKey: brand.key,
          action: 'claim'
        }))
        onSuccess?.()
      }
    } catch (err) {
      const errorMsg = (err as Error).message
      if (errorMsg.includes('不支持') || errorMsg.includes('TODO')) {
        setClaimSupported(false)
      }
    }
  }

  const isConfigured = isBrandConfigured(brand)
  const canSubmit = address && isConfigured && claimSupported && !isLoading

  if (!claimSupported) {
    return (
      <div className="glass-panel rounded-xl p-6">
        <div className="font-semibold mb-2" style={{ color: 'var(--warning)' }}>
          ⚠️ Claim Not Supported
        </div>
        <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
          This virtual asset or account does not currently support Claim operations. Please try again later or contact support.
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {!isConfigured && (
        <div className="glass-panel rounded-xl p-4">
          <div className="font-semibold mb-1" style={{ color: 'var(--warning)' }}>
            ⚠️ Configuration Incomplete
          </div>
          <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Current virtual asset not configured. Coin Type is TODO_REPLACE_ME.
          </div>
        </div>
      )}

      <div className="glass-panel rounded-xl p-4">
        <div className="text-sm font-medium mb-3" style={{ color: 'var(--text-muted)' }}>
          Claim 前置检查
        </div>
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <Chip className="chip-pending" size="sm">提醒</Chip>
            <div className="flex-1">
              <div className="text-sm" style={{ color: 'var(--text)' }}>
                交易记录
              </div>
              <div className="text-xs" style={{ color: 'var(--text-dim)' }}>
                Claim 需要你在平台中有活跃的交易记录。如果你从未通过本应用购买虚拟商品，
                将无法 Claim 奖励。
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Chip className="chip-pending" size="sm">提醒</Chip>
            <div className="flex-1">
              <div className="text-sm" style={{ color: 'var(--text)' }}>
                可领取奖励金额
              </div>
              <div className="text-xs" style={{ color: 'var(--text-dim)' }}>
                ⚠️ 无法自动查询。如果报错 "err_insufficient_deposit"，
                表示当前没有可领取的奖励。
              </div>
            </div>
          </div>

          <div className="mt-2 p-3 rounded-lg" style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)'
          }}>
            <div className="text-sm font-medium mb-1" style={{ color: 'var(--info)' }}>
              💡 建议操作流程
            </div>
            <div className="text-xs space-y-1" style={{ color: 'var(--text-dim)' }}>
              <p>1. 先通过 Buy tab 购买虚拟商品，获得 {brand.displayName}</p>
              <p>2. 等待一段时间让交易奖励累积</p>
              <p>3. 再回到 Claim tab 领取奖励</p>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-xl p-4">
        <div className="text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
          领取内容
        </div>
        <div className="space-y-1 text-sm" style={{ color: 'var(--text-dim)' }}>
          <p>• 交易奖励（{brand.displayName} 持有产生）</p>
          <p>• 奖励类型：USDC 或平台代币</p>
          <p>• 奖励将转入你的钱包地址</p>
        </div>
      </div>

      <Button
        className="btn-gradient w-full"
        isDisabled={!canSubmit}
        onPress={handleClaim}
      >
        {isLoading ? getLoadingText(state) : 'Claim Rewards'}
      </Button>

      <TxFeedbackCard state={state} result={result} action="claim" onReset={reset} />

      {state === 'success' && (
        <div className="glass-panel rounded-xl p-4">
          <div className="font-semibold mb-1" style={{ color: 'var(--success)' }}>
            ✓ Rewards Claimed
          </div>
          <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Trading rewards successfully claimed. Check your balance.
          </div>
        </div>
      )}
    </div>
  )
}

function getLoadingText(state: string): string {
  switch (state) {
    case 'building':
      return 'Building transaction...'
    case 'signing':
      return 'Waiting for signature...'
    case 'executing':
      return 'Executing...'
    default:
      return 'Claim Rewards'
  }
}
