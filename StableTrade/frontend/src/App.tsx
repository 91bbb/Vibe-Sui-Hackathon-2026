import { useState } from 'react'
import { TopNav } from './components/TopNav'
import { Hero } from './components/Hero'
import { OperationsPanel } from './components/OperationsPanel'
import { VirtualGoodsPage } from './components/VirtualGoodsPage'



type Page = 'home' | 'virtualGoods'

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home')
  

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
