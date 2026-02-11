import { useState, useEffect } from 'react'
import { Button, Input } from '@heroui/react'
import { useAppStore } from '../lib/store'
import { buildBuyTx } from '../lib/stablelayer/adapter'
import { getNetworkConfig } from '../config/networks'
import { isBrandConfigured } from '../config/brands'
import { useTransaction } from '../hooks/useTransaction'
import { useTxHistory, createSuccessTx } from '../hooks/useTxHistory'
import { TxFeedbackCard } from './TxFeedbackCard'
import { AddProductModal } from './AddProductModal'
import type { VirtualProduct } from '../types/products'

export function VirtualGoodsPage() {
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null)
  const [amount, setAmount] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  
  const suiClient = useAppStore((state) => state.suiClient)
  const address = useAppStore((state) => state.address)
  const network = useAppStore((state) => state.selectedNetwork)
  const brand = useAppStore((state) => state.selectedBrand)
  const products = useAppStore((state) => state.products)
  const fetchProducts = useAppStore((state) => state.fetchProducts)
  const updateProduct = useAppStore((state) => state.updateProduct)
  const deleteProduct = useAppStore((state) => state.deleteProduct)

  const { state, result, isLoading, execute, reset } = useTransaction()
  const { addTx } = useTxHistory()

  useEffect(() => {
    fetchProducts()
  }, [])

  const defaultProducts = [
    {
      id: 'gold',
      name: '虚拟黄金',
      price: '1,000 USDC',
      usdcAmount: '1000',
      description: '由 NFT 资产背书的数字黄金，价值稳定',
      icon: '🥇',
      tag: '热门',
      creator: 'system',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isListed: true
    },
    {
      id: 'silver',
      name: '虚拟白银',
      price: '500 USDC',
      usdcAmount: '500',
      description: '数字白银，适合小额投资',
      icon: '🥈',
      tag: '推荐',
      creator: 'system',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isListed: true
    },
    {
      id: 'game',
      name: '游戏积分',
      price: '100 USDC',
      usdcAmount: '100',
      description: '游戏内通用积分，可在多款游戏中使用',
      icon: '🎮',
      tag: '新品',
      creator: 'system',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isListed: true
    },
    {
      id: 'diamond',
      name: '虚拟钻石',
      price: '2,000 USDC',
      usdcAmount: '2000',
      description: '稀有数字钻石，收藏价值高',
      icon: '💎',
      tag: '稀有',
      creator: 'system',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isListed: true
    },
    {
      id: 'art',
      name: '数字艺术品',
      price: '1,500 USDC',
      usdcAmount: '1500',
      description: '限量版数字艺术品，独一无二',
      icon: '🎨',
      tag: '限量',
      creator: 'system',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isListed: true
    },
    {
      id: 'land',
      name: '虚拟土地',
      price: '5,000 USDC',
      usdcAmount: '5000',
      description: '元宇宙虚拟土地，可建造和交易',
      icon: '🏞️',
      tag: '投资',
      creator: 'system',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isListed: true
    }
  ]

  const displayProducts = products.length > 0 ? products : defaultProducts

  const handleBuy = async () => {
    if (!address || !selectedProduct) return

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
      reset()
      setSelectedProduct(null)
      setAmount('')
    }
  }

  const handleEditProduct = (product: VirtualProduct) => {
    setSelectedProduct(product.id)
    setAmount(product.usdcAmount)
  }

  const handleDeleteProduct = (id: string) => {
    if (confirm('确定要删除这个商品吗？')) {
      deleteProduct(id)
    }
  }

  const handleToggleListing = (id: string, currentStatus: boolean) => {
    updateProduct(id, { isListed: !currentStatus })
  }

  const handleAddProduct = () => {
    if (!address) {
      alert('请先连接钱包以创建商品')
      return
    }
    setIsAddModalOpen(true)
  }

  const isConfigured = isBrandConfigured(brand)
  const canSubmit = address && amount && parseFloat(amount) > 0 && isConfigured && !isLoading

  return (
    <section className="relative py-20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
          <h1
            className="text-4xl md:text-5xl font-bold"
            style={{ color: 'var(--text)' }}
          >
            虚拟商品商城
          </h1>
          <Button
            className="btn-gradient bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold px-8 py-4"
            onPress={handleAddProduct}
            style={{
              borderRadius: '12px',
              fontSize: '16px',
              boxShadow: '0 4px 15px rgba(6, 182, 212, 0.4)',
              transition: 'all 0.3s ease'
            }}
          >
            ➕ 新增商品
          </Button>
        </div>

        <p
          className="text-lg mb-8"
          style={{ color: 'var(--text-muted)' }}
        >
          选择并购买您喜欢的虚拟商品
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayProducts.map((product) => (
            <div
              key={product.id}
              className={`glass-card rounded-xl p-5 transition-all duration-200 hover:scale-[1.02] cursor-pointer ${
                selectedProduct === product.id ? 'ring-4 ring-cyan' : ''
              }`}
              onClick={() => {
                setSelectedProduct(product.id)
                setAmount(product.usdcAmount)
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="text-4xl">{product.icon}</div>
                <div
                  className="px-2 py-1 rounded-full text-xs font-bold"
                  style={{
                    background: product.tag === '热门' ? 'var(--pink-subtle)' : 
                               product.tag === '推荐' ? 'var(--cyan-subtle)' : 
                               product.tag === '新品' ? 'var(--green-subtle)' :
                               product.tag === '稀有' ? 'var(--purple-subtle)' :
                               product.tag === '限量' ? 'var(--orange-subtle)' :
                               'var(--surface-2)',
                    border: product.tag === '热门' ? '1px solid var(--pink)' : 
                            product.tag === '推荐' ? '1px solid var(--cyan)' : 
                            product.tag === '新品' ? '1px solid var(--green)' :
                            product.tag === '稀有' ? '1px solid var(--purple)' :
                            product.tag === '限量' ? '1px solid var(--orange)' :
                            '1px solid var(--border)',
                    color: product.tag === '热门' ? 'var(--pink-2)' : 
                           product.tag === '推荐' ? 'var(--cyan-2)' : 
                           product.tag === '新品' ? 'var(--green-2)' :
                           product.tag === '稀有' ? 'var(--purple-2)' :
                           product.tag === '限量' ? 'var(--orange-2)' :
                           'var(--text-dim)'
                  }}
                >
                  {product.tag}
                </div>
              </div>
              <h3
                className="text-lg font-bold mb-2"
                style={{ color: 'var(--text)' }}
              >
                {product.name}
              </h3>
              <div
                className="text-xl font-bold mb-2"
                style={{ color: 'var(--cyan)' }}
              >
                {product.price}
              </div>
              <p
                className="text-sm leading-relaxed mb-4"
                style={{ color: 'var(--text-muted)' }}
              >
                {product.description}
              </p>
              
              {product.creator === address && (
                <div className="space-y-2 mb-4">
                  <div className="flex gap-2">
                    <Button
                      className="flex-1 btn-ghost border border-cyan/30 hover:border-cyan"
                      onPress={() => handleEditProduct(product)}
                      style={{ borderRadius: '8px' }}
                    >
                      编辑
                    </Button>
                    <Button
                      className="flex-1 btn-danger border border-red/30 hover:border-red"
                      onPress={() => handleDeleteProduct(product.id)}
                      style={{ borderRadius: '8px' }}
                    >
                      删除
                    </Button>
                  </div>
                  <Button
                    className={`w-full ${product.isListed ? 'btn-warning bg-yellow-500 hover:bg-yellow-600' : 'btn-success bg-green-500 hover:bg-green-600'} text-white`}
                    onPress={() => handleToggleListing(product.id, product.isListed)}
                    style={{ borderRadius: '8px' }}
                  >
                    {product.isListed ? '下架' : '上架'}
                  </Button>
                </div>
              )}
              
              <Button
                className="w-full btn-gradient bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold"
                onPress={() => {
                  setSelectedProduct(product.id)
                  setAmount(product.usdcAmount)
                }}
                style={{ borderRadius: '8px', padding: '10px' }}
              >
                选择购买
              </Button>
            </div>
          ))}
        </div>

        {selectedProduct && (
          <div className="mt-12 glass-panel rounded-2xl p-8 border border-cyan/30">
            <h2
              className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent"
            >
              购买确认
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <div className="mb-6">
                  <label className="text-sm font-semibold mb-3 block text-cyan-400">
                    商品名称
                  </label>
                  <div
                    className="glass-card rounded-xl p-4 border border-cyan/30"
                    style={{ color: 'var(--text)' }}
                  >
                    {displayProducts.find(p => p.id === selectedProduct)?.name}
                  </div>
                </div>

                <div className="mb-6">
                  <label className="text-sm font-semibold mb-3 block text-cyan-400">
                    购买金额 (USDC)
                  </label>
                  <Input
                    placeholder="Enter amount (e.g. 1000)"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={isLoading || !isConfigured}
                    className="input-glass border border-cyan/30 focus:border-cyan focus:ring-2 focus:ring-cyan/50"
                    style={{ borderRadius: '8px', padding: '12px' }}
                  />
                  {!isConfigured && (
                    <p className="text-sm mt-2" style={{ color: 'var(--warning)' }}>
                      ⚠️ Current virtual asset not configured. Coin Type is TODO_REPLACE_ME
                    </p>
                  )}
                </div>
              </div>

              <div>
                <div className="glass-card rounded-xl p-6 h-full border border-cyan/30">
                  <h3 className="text-lg font-bold mb-4 text-cyan-400">
                    购买详情
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span style={{ color: 'var(--text-muted)' }}>商品</span>
                      <span style={{ color: 'var(--text)' }}>
                        {displayProducts.find(p => p.id === selectedProduct)?.name}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span style={{ color: 'var(--text-muted)' }}>价格</span>
                      <span style={{ color: 'var(--text)' }}>
                        {amount} USDC
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span style={{ color: 'var(--text-muted)' }}>将获得</span>
                      <span style={{ color: 'var(--text)' }}>
                        {amount} {brand.displayName}
                      </span>
                    </div>
                    
                    <div className="border-t border-cyan/20 pt-4 mt-4 flex justify-between items-center">
                      <span className="font-bold" style={{ color: 'var(--text)' }}>总计</span>
                      <span className="font-bold text-lg bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                        {amount} USDC
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-4">
              <Button
                className="flex-1 btn-ghost border border-gray-400 hover:border-gray-600"
                onPress={() => {
                  setSelectedProduct(null)
                  setAmount('')
                  reset()
                }}
                style={{ borderRadius: '8px', padding: '12px' }}
              >
                取消
              </Button>
              <Button
                className="flex-2 btn-gradient bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold"
                isDisabled={!canSubmit}
                onPress={handleBuy}
                style={{ borderRadius: '8px', padding: '12px', boxShadow: '0 4px 15px rgba(6, 182, 212, 0.4)' }}
              >
                {isLoading ? (
                  state === 'building' ? '构建交易中...' :
                  state === 'signing' ? '等待签名...' :
                  state === 'executing' ? '执行中...' :
                  '购买中...'
                ) : (
                  '确认购买'
                )}
              </Button>
            </div>

            <TxFeedbackCard state={state} result={result} action="buy" onReset={reset} />
          </div>
        )}
      </div>
      
      <AddProductModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
    </section>
  )
}
