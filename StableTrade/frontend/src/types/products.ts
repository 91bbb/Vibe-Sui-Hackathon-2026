export interface VirtualProduct {
  id: string
  name: string
  price: string
  usdcAmount: string
  description: string
  icon: string
  tag: string
  creator: string
  createdAt: number
  updatedAt: number
  isListed: boolean
  tokenId?: string
  collectionId?: string
}

export type ProductTag = '热门' | '推荐' | '新品' | '稀有' | '限量' | '投资'

export interface CreateProductParams {
  name: string
  price: string
  usdcAmount: string
  description: string
  icon: string
  tag: ProductTag
}
