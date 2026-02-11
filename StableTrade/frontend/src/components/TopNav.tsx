import { NetworkSelect } from './NetworkSelect'
import { BrandSelect } from './BrandSelect'
import { WalletConnectButton } from './WalletConnect'
import { Button } from '@heroui/react'

interface TopNavProps {
  onVirtualGoodsClick?: () => void
  onBackClick?: () => void
}

export function TopNav({ onVirtualGoodsClick, onBackClick }: TopNavProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 px-4 pt-4">
      <nav className="glass-card max-w-7xl mx-auto rounded-2xl">
        <div className="px-6 py-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div className="flex items-center gap-3">
              <div
                className="w-[26px] h-[26px] rounded-lg flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, var(--cyan) 0%, var(--pink) 100%)',
                  boxShadow: '0 2px 8px rgba(6, 182, 212, 0.3)'
                }}
              >
                <span className="text-sm font-bold" style={{ color: 'var(--bg)' }}>ST</span>
              </div>
              <h1
                className="text-2xl font-bold tracking-wide"
                style={{
                  color: 'var(--text)',
                  textShadow: '0 0 20px var(--cyan-glow)'
                }}
              >
                StableTrade
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {onBackClick && (
                <Button
                  className="btn-ghost"
                  onPress={onBackClick}
                >
                  ← 返回首页
                </Button>
              )}
              {onVirtualGoodsClick && (
                <Button
                  className="btn-gradient"
                  onPress={onVirtualGoodsClick}
                >
                  🛒 虚拟商品商城
                </Button>
              )}
              <NetworkSelect />
              <BrandSelect />
              <WalletConnectButton />
            </div>
          </div>
        </div>
      </nav>
    </div>
  )
}
