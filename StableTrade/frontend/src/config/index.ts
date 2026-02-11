import { NETWORKS, type NetworkType } from './networks'

export interface NetworkConfig {
  key: NetworkType
  displayName: string
  url: string
  usdcCoinType: string
  usdcDecimals: number
}

export function getNetworkConfig(network: NetworkType): NetworkConfig {
  return NETWORKS[network]
}
