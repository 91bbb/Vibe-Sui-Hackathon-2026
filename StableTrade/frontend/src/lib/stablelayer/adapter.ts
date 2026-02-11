import { Transaction } from '@mysten/sui/transactions'
import type { BuyTxOptions, SellTxOptions, ClaimTxOptions, TxResult } from '../../types/transactions'

export async function buildBuyTx(options: BuyTxOptions): Promise<TxResult> {
  const { suiClient, sender, usdcCoinType } = options

  const tx = new Transaction()

  const usdcCoins = await suiClient.getCoins({
    owner: sender,
    coinType: usdcCoinType
  })

  if (!usdcCoins.data || usdcCoins.data.length === 0) {
    throw new Error('No USDC coins found in wallet')
  }

  const [primaryCoin, ...otherCoins] = usdcCoins.data

  if (otherCoins.length > 0) {
    tx.mergeCoins(
      tx.object(primaryCoin.coinObjectId),
      otherCoins.map((coin: any) => tx.object(coin.coinObjectId))
    )
  }

  tx.transferObjects(
    [tx.object(primaryCoin.coinObjectId)],
    tx.object(sender)
  )

  return { tx }
}

export async function buildSellTx(options: SellTxOptions): Promise<TxResult> {
  const { suiClient, sender, brandCoinType } = options

  const tx = new Transaction()

  const brandCoins = await suiClient.getCoins({
    owner: sender,
    coinType: brandCoinType
  })

  if (!brandCoins.data || brandCoins.data.length === 0) {
    throw new Error('No virtual asset coins found in wallet')
  }

  const [primaryCoin, ...otherCoins] = brandCoins.data

  if (otherCoins.length > 0) {
    tx.mergeCoins(
      tx.object(primaryCoin.coinObjectId),
      otherCoins.map((coin: any) => tx.object(coin.coinObjectId))
    )
  }

  tx.transferObjects(
    [tx.object(primaryCoin.coinObjectId)],
    tx.object(sender)
  )

  return { tx }
}

export async function buildClaimTx(options: ClaimTxOptions): Promise<TxResult> {
  const { sender } = options

  const tx = new Transaction()

  tx.transferObjects(
    [tx.gas],
    tx.object(sender)
  )

  return { tx }
}
