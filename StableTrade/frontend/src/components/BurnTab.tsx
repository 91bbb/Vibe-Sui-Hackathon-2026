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

interface BurnTabProps {
  onSuccess?: (mode?: 't_plus_1' | 'instant') => void
}

export function BurnTab({ onSuccess }: BurnTabProps) {
  const [amount, setAmount] = useState('')
  const [mode, setMode] = useState<'instant' | 't_plus_1'>('instant')
  const suiClient = useAppStore((state) => state.suiClient)
  const address = useAppStore((state) => state.address)
  const network = useAppStore((state) => state.selectedNetwork)
  const brand = useAppStore((state) => state.selectedBrand)

  const { state, result, isLoading, execute, reset } = useTransaction()
  const { addTx } = useTxHistory()
  const { addPending } = usePendingOrders()
  const { balances } = useBalances()

  const handleBurn = async () => {
    if (!address) return

    const success = await execute(async () => {
      const { tx } = await buildSellTx({
        suiClient,
        sender: address,
        brandCoinType: brand.coinType,
        amountDecimalString: amount,
        mode: mode,
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

      if (mode === 't_plus_1') {
        addPending({
          digest: result.digest,
          time: Date.now(),
          network,
          brandKey: brand.key,
          amount: `${amount} ${brand.displayName}`,
          brandCoinType: brand.coinType
        })
      }

      onSuccess?.(mode)
    }
  }

  const isConfigured = isBrandConfigured(brand)
  const brandBalanceNum = parseFloat(balances.brand.balance) || 0
  const requestedAmount = parseFloat(amount) || 0

  const hasEnoughBalance = brandBalanceNum > 0 && requestedAmount > 0 && requestedAmount <= brandBalanceNum

  let disabledReason = ''
  if (!address) disabledReason = '请先连接钱包'
  else if (!isConfigured) disabledReason = '虚拟商品未配置 Coin Type'
  else if (brandBalanceNum === 0) disabledReason = '钱包中无可赎回的 BrandUSD 余额'
  else if (requestedAmount === 0) disabledReason = '请输入赎回金额'
  else if (requestedAmount > brandBalanceNum) disabledReason = '赎回金额超过钱包余额'

  const canSubmit = address && amount && parseFloat(amount) > 0 && isConfigured && hasEnoughBalance && !isLoading

  return (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-semibold mb-3 block" style={{ color: 'var(--text)' }}>
          赎回金额 ({brand.displayName})
        </label>
        <Input
          placeholder="输入金额 (例如: 1.0)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={isLoading || !isConfigured}
          className="input-glass"
        />
        {!isConfigured && (
          <p className="text-sm mt-2" style={{ color: 'var(--warning)' }}>
            ⚠️ 当前虚拟商品未配置。Coin Type 为 TODO_REPLACE_ME
          </p>
        )}
      </div>

      <div className="glass-panel rounded-xl p-4">
        <div className="text-sm font-medium mb-3" style={{ color: 'var(--text-muted)' }}>
          赎回方式
        </div>
        <div className="flex gap-3">
          <button
            className={`flex-1 py-3 px-4 rounded-xl font-medium text-sm transition-all ${
              mode === 'instant' ? 'btn-gradient' : 'btn-soft'
            }`}
            onClick={() => setMode('instant')}
            disabled={isLoading}
          >
            <div className="text-center">
              <div className="font-bold mb-1">即时赎回</div>
              <div className="text-xs opacity-80">有费用 | 即时到账</div>
            </div>
          </button>
          <button
            className={`flex-1 py-3 px-4 rounded-xl font-medium text-sm transition-all ${
              mode === 't_plus_1' ? 'btn-gradient' : 'btn-soft'
            }`}
            onClick={() => setMode('t_plus_1')}
            disabled={isLoading}
          >
            <div className="text-center">
              <div className="font-bold mb-1">T+1 赎回</div>
              <div className="text-xs opacity-80">0 费用 | 次日结算</div>
            </div>
          </button>
        </div>
      </div>

      <div className="glass-panel rounded-xl p-4">
        <div className="text-sm font-medium mb-3" style={{ color: 'var(--text-muted)' }}>
          赎回前置检查
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
            <Chip className="chip-pending" size="sm">说明</Chip>
            <div className="flex-1">
              <div className="text-sm" style={{ color: 'var(--text)' }}>
                赎回比例
              </div>
              <div className="text-xs" style={{ color: 'var(--text-dim)' }}>
                1 {brand.displayName} = 1 USDC
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Chip className="chip-pending" size="sm">{mode === 'instant' ? '即时' : 'T+1'}</Chip>
            <div className="flex-1">
              <div className="text-sm" style={{ color: 'var(--text)' }}>
                {mode === 'instant' ? '即时结算模式' : 'T+1 结算模式'}
              </div>
              <div className="text-xs" style={{ color: 'var(--text-dim)' }}>
                {mode === 'instant' 
                  ? '赎回请求提交后即时结算，USDC 将立即转入你的钱包。'
                  : '赎回请求提交后次日结算，USDC 将在次日转入你的钱包。'
                }
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
                onPress={handleBurn}
              >
                {isLoading ? getLoadingText(state) : `赎回 (${mode === 'instant' ? '即时' : 'T+1'})`}
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
          onPress={handleBurn}
        >
          {isLoading ? getLoadingText(state) : `赎回 (${mode === 'instant' ? '即时' : 'T+1'})`}
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
            ✓ 赎回请求完成
          </div>
          <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {mode === 'instant' 
              ? '即时赎回完成。USDC 已转入你的钱包。'
              : 'T+1 赎回请求已提交。USDC 将在次日转入你的钱包。已添加到待处理订单。'
            }
          </div>
        </div>
      )}

      <TxFeedbackCard state={state} result={result} action="burn" onReset={reset} />

      <div className="glass-panel rounded-lg p-3 text-sm space-y-1" style={{ color: 'var(--text-dim)' }}>
        <p>• 赎回 {amount || '0'} {brand.displayName} 以获得等值的 USDC</p>
        <p>• {mode === 'instant' ? '即时模式：交易即时结算' : 'T+1 模式：交易次日结算'}</p>
        <p>• USDC 将转入你的钱包地址</p>
      </div>
    </div>
  )
}

function getLoadingText(state: string): string {
  switch (state) {
    case 'building':
      return '构建交易中...'
    case 'signing':
      return '等待签名...'
    case 'executing':
      return '执行中...'
    default:
      return '赎回 BrandUSD'
  }
}
