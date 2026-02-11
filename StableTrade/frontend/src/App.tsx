import { useState } from 'react'
import { TopNav } from './components/TopNav'
import { Hero } from './components/Hero'
import { OperationsPanel } from './components/OperationsPanel'
import { VirtualGoodsPage } from './components/VirtualGoodsPage'
import { useBalances } from './hooks/useBalances'
import { useTxHistory } from './hooks/useTxHistory'
import { usePendingOrders } from './hooks/usePendingOrders'
import { useGuidedFlow } from './hooks/useGuidedFlow'
import { showToast } from './lib/toast'

type Page = 'home' | 'virtualGoods'

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home')
  
  const { balances, refresh: refreshBalances } = useBalances()
  const { history } = useTxHistory()
  const { pendings } = usePendingOrders()

  const { steps, currentStepKey, setCurrentStepKey, goToStep, onActionSuccess } = useGuidedFlow({
    usdcBalance: balances.usdc.balance,
    brandBalance: balances.brand.balance,
    history,
    pendings
  })

  const handleTxSuccess = () => {
    setTimeout(() => {
      refreshBalances()
    }, 2000)
  }

  const handleActionSuccess = (action: any, extra?: { mode?: 't_plus_1' | 'instant' }) => {
    onActionSuccess(action, extra)

    if (action === 'buy') {
      showToast({
        message: '购买完成 ✅ 下一步：卖出',
        action: {
          label: '去卖出',
          onClick: () => goToStep('sell')
        }
      })
    } else if (action === 'sell') {
      showToast({
        message: '卖出完成 ✅ 下一步：领取奖励',
        action: {
          label: '去领取',
          onClick: () => goToStep('claim')
        }
      })
    } else if (action === 'claim') {
      showToast({
        message: '领取完成 ✅',
        duration: 3000
      })
    }
  }

  const handleVirtualGoodsClick = () => {
    setCurrentPage('virtualGoods')
  }

  const handleBackToHome = () => {
    setCurrentPage('home')
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      <TopNav 
        onVirtualGoodsClick={currentPage === 'home' ? handleVirtualGoodsClick : undefined}
        onBackClick={currentPage === 'virtualGoods' ? handleBackToHome : undefined}
      />

      <div className="pt-20">
        {currentPage === 'home' ? (
          <>
            <Hero onVirtualGoodsClick={handleVirtualGoodsClick} />
            <OperationsPanel />
          </>
        ) : (
          <VirtualGoodsPage />
        )}
      </div>

      <footer
        className="mt-20 py-8"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>
            Built with HeroUI v3, Vite, React, Sui
          </p>
          <p className="text-xs" style={{ color: 'var(--text-dim)' }}>
            © 2026 StableTrade. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
