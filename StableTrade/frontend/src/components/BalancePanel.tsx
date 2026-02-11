import { Card } from '@heroui/react'
import { useBalances } from '../hooks/useBalances'
import { useAppStore } from '../lib/store'

export function BalancePanel() {
  const address = useAppStore((state) => state.address)
  const brand = useAppStore((state) => state.selectedBrand)
  const { balances, refresh, isLoading } = useBalances()

  if (!address) {
    return (
      <Card className="card-glass rounded-2xl">
        <Card.Header>
          <Card.Title>Wallet Balances</Card.Title>
          <Card.Description>
            Connect your wallet to view balances
          </Card.Description>
        </Card.Header>
      </Card>
    )
  }

  return (
    <Card className="card-glass rounded-2xl">
      <Card.Header>
        <div className="flex justify-between items-center w-full">
          <Card.Title>Wallet Balances</Card.Title>
          <button
            className="btn-soft"
            disabled={isLoading}
            onClick={refresh}
          >
            {isLoading ? 'Refreshing...' : '🔄 Refresh'}
          </button>
        </div>
      </Card.Header>

      <Card.Content>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="glass-panel rounded-xl p-5 transition-all duration-200 hover:scale-[1.01]">
            <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--text-dim)' }}>
              USDC
            </div>
            <div className="text-3xl font-bold mb-1" style={{ color: 'var(--text)' }}>
              {balances.usdc.isLoading ? (
                <span style={{ color: 'var(--text-dim)' }}>...</span>
              ) : (
                balances.usdc.balance
              )}
            </div>
            <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {balances.usdc.symbol}
            </div>
          </div>

          <div className="glass-panel rounded-xl p-5 transition-all duration-200 hover:scale-[1.01]">
            <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--text-dim)' }}>
              Virtual Asset
            </div>
            <div className="text-3xl font-bold mb-1" style={{ color: 'var(--cyan)' }}>
              {balances.brand.isLoading ? (
                <span style={{ color: 'var(--text-dim)' }}>...</span>
              ) : (
                balances.brand.balance
              )}
            </div>
            <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {brand.displayName} ({balances.brand.symbol})
            </div>
          </div>
        </div>
      </Card.Content>
    </Card>
  )
}
