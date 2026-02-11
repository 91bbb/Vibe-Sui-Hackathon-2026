import { useState } from 'react'
import { Button, Input } from '@heroui/react'
import { useAppStore } from '../lib/store'
import { buildBuyTx } from '../lib/stablelayer/adapter'
import { getNetworkConfig } from '../config/networks'
import { isBrandConfigured } from '../config/brands'
import { useTransaction } from '../hooks/useTransaction'
import { useTxHistory, createSuccessTx } from '../hooks/useTxHistory'
import { TxFeedbackCard } from './TxFeedbackCard'

interface MintTabProps {
  onSuccess?: () => void
}

export function MintTab({ onSuccess }: MintTabProps) {
  const [amount, setAmount] = useState('')
  const suiClient = useAppStore((state) => state.suiClient)
  const address = useAppStore((state) => state.address)
  const network = useAppStore((state) => state.selectedNetwork)
  const brand = useAppStore((state) => state.selectedBrand)

  const { state, result, isLoading, execute, reset } = useTransaction()
  const { addTx } = useTxHistory()

  const handleMint = async () => {
    if (!address) return

    const success = await execute(async () => {
      const networkConfig = getNetworkConfig(network)

      const { tx } = await buildBuyTx({
        suiClient,
        sender: address,
        brandCoinType: brand.coinType,
        usdcCoinType: networkConfig.usdcCoinType,
        amountDecimalString: amount,
        network
      })

      return tx
    })

    if (success && result.digest) {
      addTx(createSuccessTx({
        digest: result.digest,
        network,
        brandKey: brand.key,
        action: 'buy',
        amount: `${amount} USDC`
      }))
      onSuccess?.()
    }
  }

  const isConfigured = isBrandConfigured(brand)
  const canSubmit = address && amount && parseFloat(amount) > 0 && isConfigured && !isLoading

  return (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-semibold mb-3 block" style={{ color: 'var(--text)' }}>
          充值金额 (USDC)
        </label>
        <Input
          placeholder="输入金额 (例如: 10.5)"
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

      <div
        className="rounded-xl p-4"
        style={{
          background: 'var(--surface-2)',
          border: '1px solid var(--border)'
        }}
      >
        <div className="text-sm font-medium mb-3" style={{ color: 'var(--text-muted)' }}>
          您将收到
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span style={{ color: 'var(--text-dim)' }}>金额</span>
            <span
              className="font-semibold text-lg"
              style={{ color: 'var(--cyan)' }}
            >
              {amount || '0'} {brand.displayName}
            </span>
          </div>
          <div className="text-xs" style={{ color: 'var(--text-dim)' }}>
            BrandUSD 将自动转入您的钱包地址
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-xl p-4">
        <div className="text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
          操作说明
        </div>
        <div className="space-y-2 text-xs" style={{ color: 'var(--text-dim)' }}>
          <p>• 存入 USDC 以铸造 BrandUSD 稳定币</p>
          <p>• SDK 会自动构建交易并通过 Stable Layer 铸造</p>
          <p>• BrandUSD 将自动转入您的钱包</p>
        </div>
      </div>

      <Button
        className="btn-gradient w-full"
        isDisabled={!canSubmit}
        onPress={handleMint}
      >
        {isLoading ? getLoadingText(state) : '铸造 BrandUSD'}
      </Button>

      <TxFeedbackCard state={state} result={result} action="mint" onReset={reset} />
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
      return '铸造 BrandUSD'
  }
}
