export type NetworkType = 'mainnet' | 'testnet' | 'devnet'

export interface NetworkConfig {
  key: NetworkType
  displayName: string
  url: string
  usdcCoinType: string
  usdcDecimals: number
}

export const NETWORKS: Record<NetworkType, NetworkConfig> = {
  mainnet: {
    key: 'mainnet',
    displayName: 'Mainnet',
    url: 'https://fullnode.mainnet.sui.io',
    usdcCoinType: '0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN',
    usdcDecimals: 6
  },
  testnet: {
    key: 'testnet',
    displayName: 'Testnet',
    url: 'https://fullnode.testnet.sui.io',
    usdcCoinType: '0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN',
    usdcDecimals: 6
  },
  devnet: {
    key: 'devnet',
    displayName: 'Devnet',
    url: 'https://fullnode.devnet.sui.io',
    usdcCoinType: '0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN',
    usdcDecimals: 6
  }
}

export function getNetworkConfig(network: NetworkType): NetworkConfig {
  return NETWORKS[network]
}
