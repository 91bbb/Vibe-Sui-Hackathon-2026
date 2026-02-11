export interface TxOptions {
  suiClient: any
  sender: string
  network: string
}

export interface BuyTxOptions extends TxOptions {
  brandCoinType: string
  usdcCoinType: string
  amountDecimalString: string
}

export interface SellTxOptions extends TxOptions {
  brandCoinType: string
  amountDecimalString: string
  mode: 't_plus_1' | 'instant'
}

export interface ClaimTxOptions extends TxOptions {
  brandCoinType: string
}

export interface TxResult {
  tx: any
}
