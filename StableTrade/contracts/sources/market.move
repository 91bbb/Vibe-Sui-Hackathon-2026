module stb::market {
    use std::option::{Self, Option};
    use std::string::{Self, String};
    use sui::balance::{Self, Balance};
    use sui::coin::{Self, Coin};
    use sui::object::{Self, UID, ID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::event;

    /// 导入平台币
    use stb::token::SMU;

    /// 虚拟商品
    public struct VirtualItem has key {
        id: UID,
        owner: address,
        name: String,
        description: String,
        category: u8, // 0 = NFT, 1 = 游戏道具, 2 = 虚拟地产
        price: u64,
        is_listed: bool,
        metadata_uri: String
    }

    /// 交易记录
    public struct Trade has key {
        id: UID,
        buyer: address,
        seller: address,
        item_id: ID,
        price: u64,
        timestamp: u64
    }

    /// 交易事件
    public struct TradeExecuted has copy, drop {
        trade_id: ID,
        buyer: address,
        seller: address,
        item_id: ID,
        price: u64,
        timestamp: u64
    }

    /// 创建虚拟商品
    public entry fun create_item(
        name: String,
        description: String,
        category: u8,
        metadata_uri: String,
        ctx: &mut TxContext
    ) {
        let owner = tx_context::sender(ctx);
        let item = VirtualItem {
            id: object::new(ctx),
            owner,
            name,
            description,
            category,
            price: 0,
            is_listed: false,
            metadata_uri
        };
        transfer::transfer(item, owner);
    }

    /// 上架商品
    public entry fun list_item(
        item: &mut VirtualItem,
        price: u64,
        ctx: &mut TxContext
    ) {
        assert!(item.owner == tx_context::sender(ctx), EUnauthorized);
        assert!(price > 0, EInvalidPrice);
        
        item.price = price;
        item.is_listed = true;
    }

    /// 下架商品
    public entry fun unlist_item(
        item: &mut VirtualItem,
        ctx: &mut TxContext
    ) {
        assert!(item.owner == tx_context::sender(ctx), EUnauthorized);
        
        item.is_listed = false;
    }

    /// 购买商品
    public entry fun buy_item(
        item: &mut VirtualItem,
        payment: Coin<SMU>,
        ctx: &mut TxContext
    ) {
        let buyer = tx_context::sender(ctx);
        let seller = item.owner;
        let price = item.price;
        let payment_amount = coin::value(&payment);
        let timestamp = tx_context::epoch(ctx);
        
        assert!(item.is_listed, EItemNotListed);
        assert!(buyer != seller, ESelfTransaction);
        assert!(payment_amount >= price, EInsufficientFunds);
        
        // 转移资金给卖家
        transfer::public_transfer(payment, seller);
        
        // 转移商品所有权
        item.owner = buyer;
        item.is_listed = false;
        
        // 创建交易记录
        let trade = Trade {
            id: object::new(ctx),
            buyer,
            seller,
            item_id: object::id(item),
            price,
            timestamp
        };
        
        // 发出交易事件
        event::emit(TradeExecuted {
            trade_id: object::id(&trade),
            buyer,
            seller,
            item_id: object::id(item),
            price,
            timestamp
        });
        
        transfer::transfer(trade, tx_context::sender(ctx));
    }

    /// 获取商品信息
    public fun get_item_info(item: &VirtualItem): (
        address,
        &String,
        &String,
        u8,
        u64,
        bool,
        &String
    ) {
        (
            item.owner,
            &item.name,
            &item.description,
            item.category,
            item.price,
            item.is_listed,
            &item.metadata_uri
        )
    }

    // 错误代码
    const EUnauthorized: u64 = 1;
    const EInvalidPrice: u64 = 2;
    const EItemNotListed: u64 = 3;
    const ESelfTransaction: u64 = 4;
    const EInsufficientFunds: u64 = 5;
}
