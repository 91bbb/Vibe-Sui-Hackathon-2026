import { useState } from 'react'
import { Button, Input } from '@heroui/react'
import { useAppStore } from '../lib/store'
import type { ProductTag, VirtualProduct } from '../types/products'

interface AddProductModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AddProductModal({ isOpen, onClose }: AddProductModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    usdcAmount: '',
    description: '',
    icon: '',
    tag: '新品' as ProductTag
  })
  
  const addProduct = useAppStore((state) => state.addProduct)
  const address = useAppStore((state) => state.address)

  const handleSubmit = async () => {
    if (!address) return

    const newProduct: VirtualProduct = {
      id: `product_${Date.now()}`,
      name: formData.name,
      price: formData.price,
      usdcAmount: formData.usdcAmount,
      description: formData.description,
      icon: formData.icon,
      tag: formData.tag,
      creator: address,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isListed: true
    }

    addProduct(newProduct)
    onClose()
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleTagSelect = (tag: ProductTag) => {
    setFormData(prev => ({ ...prev, tag }))
  }

  const tags: ProductTag[] = ['热门', '推荐', '新品', '稀有', '限量', '投资']

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="glass-panel rounded-xl p-6 max-w-sm w-full border-2 border-cyan">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            🚀 新增虚拟商品
          </h3>
          <Button
            className="btn-ghost hover:bg-red-500 hover:text-white transition-all"
            onPress={onClose}
            style={{ fontSize: '20px', padding: '2px 8px' }}
          >
            ×
          </Button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold mb-1 block text-cyan-400">
              商品名称 *
            </label>
            <Input
              placeholder="输入商品名称"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="input-glass border border-cyan/30 focus:border-cyan focus:ring-2 focus:ring-cyan/50"
              style={{ borderRadius: '6px', padding: '10px', fontSize: '14px' }}
            />
          </div>
          
          <div>
            <label className="text-xs font-semibold mb-1 block text-cyan-400">
              价格 (USDC) *
            </label>
            <Input
              placeholder="1000"
              value={formData.usdcAmount}
              onChange={(e) => {
                handleChange('usdcAmount', e.target.value)
                handleChange('price', `${e.target.value} USDC`)
              }}
              className="input-glass border border-cyan/30 focus:border-cyan focus:ring-2 focus:ring-cyan/50"
              style={{ borderRadius: '6px', padding: '10px', fontSize: '14px' }}
            />
          </div>
          
          <div>
            <label className="text-xs font-semibold mb-1 block text-cyan-400">
              商品描述 *
            </label>
            <Input
              placeholder="输入商品描述"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="input-glass border border-cyan/30 focus:border-cyan focus:ring-2 focus:ring-cyan/50"
              style={{ minHeight: '100px', borderRadius: '6px', padding: '10px', fontSize: '14px', textAlignVertical: 'top' }}
            />
          </div>
          
          <div>
            <label className="text-xs font-semibold mb-1 block text-cyan-400">
              商品图标
            </label>
            <Input
              placeholder="输入 emoji 图标，如 🥇"
              value={formData.icon}
              onChange={(e) => handleChange('icon', e.target.value)}
              className="input-glass border border-cyan/30 focus:border-cyan focus:ring-2 focus:ring-cyan/50"
              style={{ borderRadius: '6px', padding: '10px', fontSize: '16px' }}
            />
          </div>
          
          <div>
            <label className="text-xs font-semibold mb-2 block text-cyan-400">
              商品标签
            </label>
            <div className="flex flex-wrap gap-1">
              {tags.map((tag) => (
                <Button
                  key={tag}
                  className={`${formData.tag === tag ? 'btn-gradient bg-gradient-to-r from-cyan-500 to-blue-600' : 'btn-ghost border border-cyan/30 hover:border-cyan'}`}
                  onPress={() => handleTagSelect(tag)}
                  style={{ borderRadius: '16px', padding: '6px 12px', fontSize: '12px' }}
                >
                  {tag}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="flex gap-3 justify-end pt-3 border-t border-cyan/20">
            <Button 
              className="btn-ghost border border-gray-400 hover:border-gray-600 flex-1"
              onPress={onClose}
              style={{ borderRadius: '6px', padding: '8px', fontSize: '14px' }}
            >
              取消
            </Button>
            <Button 
              className="btn-gradient bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 flex-2 text-white font-semibold"
              onPress={handleSubmit}
              isDisabled={!formData.name || !formData.usdcAmount || !formData.description}
              style={{ borderRadius: '6px', padding: '8px', fontSize: '14px', transition: 'all 0.3s' }}
            >
              🎉 创建商品
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
