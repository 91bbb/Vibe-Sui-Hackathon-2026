import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { SuiClient } from '@mysten/sui/client'
import { NETWORKS, type NetworkType } from '../config/networks'
import { BRANDS, getBrandByKey } from '../config/brands'
import type { VirtualProduct } from '../types/products'

interface AppState {
  selectedNetwork: NetworkType
  selectedBrand: typeof BRANDS[0]
  address: string | undefined
  suiClient: SuiClient

  setNetwork: (network: NetworkType) => void
  setBrand: (brand: typeof BRANDS[0]) => void
  setAddress: (address: string | undefined) => void
}

interface ProductState {
  products: VirtualProduct[]
  isLoading: boolean
  error: string | null
  
  addProduct: (product: VirtualProduct) => void
  updateProduct: (id: string, updates: Partial<VirtualProduct>) => void
  deleteProduct: (id: string) => void
  fetchProducts: () => void
}

type StoreState = AppState & ProductState

export const useAppStore = create<StoreState>()(
  persist(
    (set, get) => ({
      selectedNetwork: 'mainnet',
      selectedBrand: BRANDS[0],
      address: undefined,
      suiClient: new SuiClient({
        url: NETWORKS.mainnet.url
      }),

      setNetwork: (network) => {
        const config = NETWORKS[network]
        set((state) => ({
          selectedNetwork: network,
          suiClient: new SuiClient({ url: config.url })
        }))
      },

      setBrand: (brand) => set({ selectedBrand: brand }),
      setAddress: (address) => set({ address }),

      products: [],
      isLoading: false,
      error: null,
      
      addProduct: (product) => {
        set((state) => {
          const updatedProducts = [...state.products, product]
          localStorage.setItem('virtual_products', JSON.stringify(updatedProducts))
          return { products: updatedProducts }
        })
      },
      
      updateProduct: (id, updates) => {
        set((state) => {
          const updatedProducts = state.products.map(product => 
            product.id === id ? { ...product, ...updates, updatedAt: Date.now() } : product
          )
          localStorage.setItem('virtual_products', JSON.stringify(updatedProducts))
          return { products: updatedProducts }
        })
      },
      
      deleteProduct: (id) => {
        set((state) => {
          const updatedProducts = state.products.filter(product => product.id !== id)
          localStorage.setItem('virtual_products', JSON.stringify(updatedProducts))
          return { products: updatedProducts }
        })
      },
      
      fetchProducts: () => {
        set({ isLoading: true, error: null })
        try {
          const storedProducts = localStorage.getItem('virtual_products')
          const products = storedProducts ? JSON.parse(storedProducts) : []
          set({ products, isLoading: false })
        } catch (error) {
          set({ error: 'Failed to fetch products', isLoading: false })
        }
      }
    }),
    {
      name: 'stabletrade-app',
      partialize: (state) => ({
        selectedNetwork: state.selectedNetwork,
        selectedBrand: state.selectedBrand
      })
    }
  )
)
