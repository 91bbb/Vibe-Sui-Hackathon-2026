import { useState } from 'react'
import { Button, Input } from '@heroui/react'
import { useAppStore } from '../lib/store'
import { buildBuyTx } from '../lib/stablelayer/adapter'
import { getNetworkConfig } from '../config/networks'
import { isBrandConfigured } from '../config/brands'
import { useTransaction } from '../hooks/useTransaction'
import { useTxHistory, createSuccessTx } from '../hooks/useTxHistory'
import { TxFeedbackCard } from './TxFeedbackCard'

interface BuyTabProps {
  onSuccess?: () => void
}

export function BuyTab({ onSuccess }: BuyTabProps) {
  const [amount, setAmount] = useState('')
  const suiClient = useAppStore((state) => state.suiClient)
  const address = useAppStore((state) => state.address)
  const network = useAppStore((state) => state.selectedNetwork)
  const brand = useAppStore((state) => state.selectedBrand)

  const { state, result, isLoading, execute, reset } = useTransaction()
  const { addTx } = useTxHistory()

  const handleBuy = async () => {
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
          Amount (USDC)
        </label>
        <Input
          placeholder="Enter amount (e.g. 10.5)"
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

      <div
        className="rounded-xl p-4"
        style={{
          background: 'var(--surface-2)',
          border: '1px solid var(--border)'
        }}
      >
        <div className="text-sm font-medium mb-3" style={{ color: 'var(--text-muted)' }}>
          You will receive
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span style={{ color: 'var(--text-dim)' }}>Amount</span>
            <span
              className="font-semibold text-lg"
              style={{ color: 'var(--cyan)' }}
            >
              {amount || '0'} {brand.displayName}
            </span>
          </div>
          <div className="text-xs" style={{ color: 'var(--text-dim)' }}>
            Virtual asset purchased automatically to your address
          </div>
        </div>
      </div>

      <Button
        className="btn-gradient w-full"
        isDisabled={!canSubmit}
        onPress={handleBuy}
      >
        {isLoading ? getLoadingText(state) : 'Buy Virtual Asset'}
      </Button>

      <TxFeedbackCard state={state} result={result} action="buy" onReset={reset} />
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
      return 'Buy Virtual Asset'
  }
}
