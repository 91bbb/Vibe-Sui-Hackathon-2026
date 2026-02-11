module stb::token {
    use std::option;
    use sui::coin::{Self, Coin, TreasuryCap};
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};

    /// 平台代币类型
    public struct SMU has drop {}

    /// 一次性见证者
    public struct TOKEN has drop {}

    /// 初始化代币系统
    fun init(witness: TOKEN, ctx: &mut TxContext) {
        let (treasury_cap, metadata) = coin::create_currency(
            witness,
            6, // 6位小数精度
            b"StableMarket", // 代币名称
            b"SMU", // 代币符号
            b"", // 描述
            option::none(), // 图标
            ctx
        );
        transfer::public_share_object(metadata);
        transfer::public_transfer(treasury_cap, tx_context::sender(ctx));
    }

    /// 铸造代币
    public fun mint(
        treasury_cap: &mut TreasuryCap<SMU>,
        amount: u64,
        ctx: &mut TxContext
    ): Coin<SMU> {
        coin::mint(treasury_cap, amount, ctx)
    }

    /// 销毁代币
    public entry fun burn(
        treasury_cap: &mut TreasuryCap<SMU>,
        coin: Coin<SMU>
    ) {
        let _ = coin::burn(treasury_cap, coin);
    }

    /// 转账代币
    public entry fun transfer(
        coin: Coin<SMU>,
        recipient: address
    ) {
        transfer::public_transfer(coin, recipient)
    }

    /// 获取代币余额
    public fun balance_of(coin: &Coin<SMU>): u64 {
        coin::value(coin)
    }
}
