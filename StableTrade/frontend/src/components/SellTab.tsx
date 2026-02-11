import { useState } from 'react'
import { Button, Input, Chip, Tooltip } from '@heroui/react'
import { useAppStore } from '../lib/store'
import { buildSellTx } from '../lib/stablelayer/adapter'
import { isBrandConfigured } from '../config/brands'
import { useTransaction } from '../hooks/useTransaction'
import { useTxHistory, createSuccessTx } from '../hooks/useTxHistory'
import { usePendingOrders } from '../hooks/usePendingOrders'
import { useBalances } from '../hooks/useBalances'
import { TxFeedbackCard } from './TxFeedbackCard'

interface SellTabProps {
  onSuccess?: (mode?: 't_plus_1' | 'instant') => void
}

export function SellTab({ onSuccess }: SellTabProps) {
  const [amount, setAmount] = useState('')
  const suiClient = useAppStore((state) => state.suiClient)
  const address = useAppStore((state) => state.address)
  const network = useAppStore((state) => state.selectedNetwork)
  const brand = useAppStore((state) => state.selectedBrand)

  const { state, result, isLoading, execute, reset } = useTransaction()
  const { addTx } = useTxHistory()
  const { addPending } = usePendingOrders()
  const { balances } = useBalances()

  const handleSell = async () => {
    if (!address) return

    const success = await execute(async () => {
      const { tx } = await buildSellTx({
        suiClient,
        sender: address,
        brandCoinType: brand.coinType,
        amountDecimalString: amount,
        mode: 'instant',
        network
      })

      return tx
    })

    if (success && result.digest) {
      addTx(createSuccessTx({
        digest: result.digest,
        network,
        brandKey: brand.key,
        action: 'sell',
        amount: `${amount} ${brand.displayName}`
      }))

      addPending({
        digest: result.digest,
        time: Date.now(),
        network,
        brandKey: brand.key,
        amount: `${amount} ${brand.displayName}`,
        brandCoinType: brand.coinType
      })

      onSuccess?.('instant')
    }
  }

  const isConfigured = isBrandConfigured(brand)
  const brandBalanceNum = parseFloat(balances.brand.balance) || 0
  const requestedAmount = parseFloat(amount) || 0

  const hasEnoughBalance = brandBalanceNum > 0 && requestedAmount > 0 && requestedAmount <= brandBalanceNum

  let disabledReason = ''
  if (!address) disabledReason = '请先连接钱包'
  else if (!isConfigured) disabledReason = '虚拟商品未配置 Coin Type'
  else if (brandBalanceNum === 0) disabledReason = '钱包中无可卖出的虚拟商品余额'
  else if (requestedAmount === 0) disabledReason = '请输入卖出金额'
  else if (requestedAmount > brandBalanceNum) disabledReason = '卖出金额超过钱包余额'

  const canSubmit = address && amount && parseFloat(amount) > 0 && isConfigured && hasEnoughBalance && !isLoading

  return (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-semibold mb-3 block" style={{ color: 'var(--text)' }}>
          Amount ({brand.displayName})
        </label>
        <Input
          placeholder="Enter amount (e.g. 1.0)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={isLoading || !isConfigured}
          className="input-glass"
        />
        {!isConfigured && (
          <p className="text-sm mt-2" style={{ color: 'var(--warning)' }}>
            ⚠️ Current virtual asset not configured. Coin Type is TODO_REPLACE_ME
          </p>
        )}
      </div>

      <div className="glass-panel rounded-xl p-4">
        <div className="text-sm font-medium mb-3" style={{ color: 'var(--text-muted)' }}>
          Sell 前置检查
        </div>
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <Chip className={brandBalanceNum > 0 ? 'chip-success' : 'chip-error'} size="sm">
              {brandBalanceNum > 0 ? 'OK' : 'NO'}
            </Chip>
            <div className="flex-1">
              <div className="text-sm" style={{ color: 'var(--text)' }}>
                钱包持有 {brand.displayName}
              </div>
              <div className="text-xs" style={{ color: 'var(--text-dim)' }}>
                当前余额：{balances.brand.balance} {brand.displayName}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Chip className="chip-pending" size="sm">提醒</Chip>
            <div className="flex-1">
              <div className="text-sm" style={{ color: 'var(--text)' }}>
                虚拟商品所有权
              </div>
              <div className="text-xs" style={{ color: 'var(--text-dim)' }}>
                ⚠️ 无法自动查询。如果你通过二级市场获得 {brand.displayName}（而非通过本应用购买），
                可能无法直接卖出。
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Chip className="chip-pending" size="sm">Instant</Chip>
            <div className="flex-1">
              <div className="text-sm" style={{ color: 'var(--text)' }}>
                即时结算模式
              </div>
              <div className="text-xs" style={{ color: 'var(--text-dim)' }}>
                卖出请求提交后即时结算，USDC 将立即转入你的钱包。
              </div>
            </div>
          </div>
        </div>
      </div>

      {disabledReason && !canSubmit ? (
        <Tooltip>
          <Tooltip.Trigger className="w-full">
            <span className="w-full inline-flex" aria-disabled="true">
              <Button
                className="btn-gradient w-full"
                isDisabled
                onPress={handleSell}
              >
                {isLoading ? getLoadingText(state) : 'Sell (Instant)'}
              </Button>
            </span>
          </Tooltip.Trigger>
          <Tooltip.Content className="tooltip-glass" showArrow>
            {disabledReason}
          </Tooltip.Content>
        </Tooltip>
      ) : (
        <Button
          className="btn-gradient w-full"
          isDisabled={!canSubmit}
          onPress={handleSell}
        >
          {isLoading ? getLoadingText(state) : 'Sell (Instant)'}
        </Button>
      )}

      {disabledReason && !canSubmit && !isLoading && (
        <div
          className="rounded-lg p-3 text-sm"
          style={{
            background: 'var(--warning-subtle)',
            border: '1px solid var(--warning)',
            color: 'var(--warning)'
          }}
        >
          ⚠️ {disabledReason}
        </div>
      )}

      {state === 'success' && (
        <div className="glass-panel rounded-xl p-4">
          <div className="font-semibold mb-1" style={{ color: 'var(--success)' }}>
            ✓ Sell Request Completed
          </div>
          <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Instant sell completed. USDC transferred to your address. Added to Pending Orders.
          </div>
        </div>
      )}

      <TxFeedbackCard state={state} result={result} action="sell" onReset={reset} />

      <div className="glass-panel rounded-lg p-3 text-sm space-y-1" style={{ color: 'var(--text-dim)' }}>
        <p>• Sell {amount || '0'} {brand.displayName} to receive equivalent USDC</p>
        <p>• Instant mode: Transaction settles immediately</p>
        <p>• USDC will be transferred to your address</p>
      </div>
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
      return 'Sell (Instant)'
  }
}
