export interface BrandConfig {
  key: string
  displayName: string
  coinType: string
  decimals: number
  supportedRedeemModes: ('t_plus_1' | 'instant')[]
  tags?: string[]
  notes?: string
}

export const BRANDS: BrandConfig[] = [
  {
    key: 'virtualGold',
    displayName: 'Virtual Gold',
    coinType: '0x0000000000000000000000000000000000000000000000000000000000000000::virtual_gold::VirtualGold',
    decimals: 9,
    supportedRedeemModes: ['instant'],
    tags: ['virtual', 'nft-backed'],
    notes: '虚拟黄金代币，由 NFT 资产背书'
  },
  {
    key: 'virtualSilver',
    displayName: 'Virtual Silver',
    coinType: '0x0000000000000000000000000000000000000000000000000000000000000000::virtual_silver::VirtualSilver',
    decimals: 9,
    supportedRedeemModes: ['instant'],
    tags: ['virtual', 'nft-backed'],
    notes: '虚拟白银代币，由 NFT 资产背书'
  },
  {
    key: 'gamePoints',
    displayName: 'Game Points',
    coinType: '0x0000000000000000000000000000000000000000000000000000000000000000::game_points::GamePoints',
    decimals: 9,
    supportedRedeemModes: ['instant'],
    tags: ['gaming', 'points'],
    notes: '游戏积分代币，可在游戏中使用'
  }
]

export function getBrandByKey(key: string): BrandConfig | undefined {
  return BRANDS.find((b) => b.key === key)
}

export function isBrandConfigured(brand: BrandConfig): boolean {
  return !brand.coinType.includes('0000000000000000000000000000000000000000000000000000000000000000')
}
