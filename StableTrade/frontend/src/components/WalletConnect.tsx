import { useEffect } from 'react'
import { useCurrentAccount, ConnectButton } from '@mysten/dapp-kit'
import { useAppStore } from '../lib/store'

function formatAddress(address: string): string {
  if (!address) return ''
  if (address.length <= 10) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function WalletConnectButton() {
  const currentAccount = useCurrentAccount()
  const setAddress = useAppStore((state) => state.setAddress)
  const address = useAppStore((state) => state.address)

  useEffect(() => {
    if (currentAccount?.address) {
      setAddress(currentAccount.address)
    } else {
      setAddress(undefined)
    }
  }, [currentAccount?.address, setAddress])

  return (
    <div className="flex items-center gap-3">
      {address && (
        <div className="hidden lg:flex items-center gap-2 px-4 h-11 rounded-xl transition-all duration-200"
          style={{
            background: 'var(--surface-2)',
            border: '1px solid var(--border)'
          }}
        >
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: 'var(--success)' }}
          />
          <code className="text-sm font-mono" style={{ color: 'var(--text-muted)' }}>
            {formatAddress(address)}
          </code>
        </div>
      )}
      <div className="wallet-connect-wrapper">
        <ConnectButton />
      </div>
    </div>
  )
}
