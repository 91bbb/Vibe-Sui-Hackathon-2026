import { useEffect, useState } from 'react'
import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit'
import { useAppStore } from '../lib/store'
import { getNetworkConfig } from '../config/networks'
import { Coin } from '@mysten/sui'

export function useBalances() {
  const suiClient = useSuiClient()
  const currentAccount = useCurrentAccount()
  const address = useAppStore((state) => state.address)
  const network = useAppStore((state) => state.selectedNetwork)
  const brand = useAppStore((state) => state.selectedBrand)

  const [balances, setBalances] = useState({
    usdc: { balance: '0', symbol: 'USDC', isLoading: false },
    brand: { balance: '0', symbol: brand.displayName, isLoading: false }
  })
  const [isRefreshing, setIsRefreshing] = useState(false)

  const refresh = async () => {
    if (!address) return

    setIsRefreshing(true)
    try {
      const networkConfig = getNetworkConfig(network)

      const [usdcCoins, brandCoins] = await Promise.all([
        suiClient.getCoins({
          owner: address,
          coinType: networkConfig.usdcCoinType
        }),
        suiClient.getCoins({
          owner: address,
          coinType: brand.coinType
        })
      ])

      const usdcBalance = usdcCoins.data.reduce(
        (total, coin) => total + BigInt(coin.balance),
        0n
      )
      const brandBalance = brandCoins.data.reduce(
        (total, coin) => total + BigInt(coin.balance),
        0n
      )

      const usdcDecimals = networkConfig.usdcDecimals || 6
      const brandDecimals = brand.decimals || 9

      const usdcBalanceStr = (Number(usdcBalance) / Math.pow(10, usdcDecimals)).toFixed(2)
      const brandBalanceStr = (Number(brandBalance) / Math.pow(10, brandDecimals)).toFixed(4)

      setBalances({
        usdc: { balance: usdcBalanceStr, symbol: 'USDC', isLoading: false },
        brand: { balance: brandBalanceStr, symbol: brand.displayName, isLoading: false }
      })
    } catch (error) {
      console.error('Failed to fetch balances:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    if (address) {
      refresh()
    }
  }, [address, network, brand.coinType])

  return {
    balances,
    refresh,
    isLoading: isRefreshing
  }
}
