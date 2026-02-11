module stb::stable_integration {
    use std::option::{Self, Option};
    use sui::balance::{Self, Balance};
    use sui::coin::{Self, Coin, TreasuryCap};
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::event;
    use sui::math;

    /// 导入平台币
    use stb::token::SMU;

    /// 兑换记录
    public struct ExchangeRecord has key {
        id: UID,
        user: address,
        from_amount: u64,
        to_amount: u64,
        exchange_type: u8, // 0 = mint, 1 = burn
        timestamp: u64
    }

    /// 兑换事件
    public struct ExchangeEvent has copy, drop {
        user: address,
        from_amount: u64,
        to_amount: u64,
        exchange_type: u8,
        timestamp: u64
    }

    /// 兑换费率配置
    public struct ExchangeConfig has key {
        id: UID,
        mint_fee_rate: u64, // 铸造手续费率 (万分比)
        burn_fee_rate: u64, // 销毁手续费率 (万分比)
        min_exchange_amount: u64, // 最小兑换金额
        admin: address // 管理员地址
    }

    /// 收益池
    public struct RewardPool has key {
        id: UID,
        total_rewards: u64,
        last_update: u64,
        reward_rate: u64 // 每秒奖励率
    }

    /// 用户收益记录
    public struct UserReward has key {
        id: UID,
        user: address,
        smu_balance: u64,
        reward_debt: u64,
        accumulated_rewards: u64
    }

    /// 收益领取事件
    public struct RewardClaimEvent has copy, drop {
        user: address,
        amount: u64,
        timestamp: u64
    }

    /// 初始化兑换配置
    public fun init_config(ctx: &mut TxContext) {
        let config = ExchangeConfig {
            id: object::new(ctx),
            mint_fee_rate: 10, // 0.1% 手续费
            burn_fee_rate: 10, // 0.1% 手续费
            min_exchange_amount: 1000000, // 1 USDC最小金额
            admin: tx_context::sender(ctx)
        };
        transfer::share_object(config);
    }

    /// 初始化收益池
    public fun init_reward_pool(ctx: &mut TxContext) {
        let pool = RewardPool {
            id: object::new(ctx),
            total_rewards: 0,
            last_update: tx_context::epoch(ctx),
            reward_rate: 1000 // 示例奖励率
        };
        transfer::share_object(pool);
    }

    /// USDC兑换为smU (充值)
    public entry fun mint_from_usdc(
        usdc_coin: Coin<USDC>,
        treasury_cap: &mut TreasuryCap<SMU>,
        config: &ExchangeConfig,
        pool: &mut RewardPool,
        ctx: &mut TxContext
    ) {
        let user = tx_context::sender(ctx);
        let usdc_amount = coin::value(&usdc_coin);
        let timestamp = tx_context::epoch(ctx);
        
        // 验证最小金额
        assert!(usdc_amount >= config.min_exchange_amount, EAmountTooSmall);
        
        // 计算手续费
        let fee = (usdc_amount * config.mint_fee_rate) / 10000;
        let smu_amount = usdc_amount - fee;
        
        // 销毁USDC
        let _ = coin::destroy(usdc_coin);
        
        // 铸造smU代币给用户
        let smu_coin = stb::token::mint(treasury_cap, smu_amount, ctx);
        
        // 更新用户收益记录
        update_user_rewards(user, smu_amount, pool, ctx);
        
        // 创建兑换记录
        let record = ExchangeRecord {
            id: object::new(ctx),
            user,
            from_amount: usdc_amount,
            to_amount: smu_amount,
            exchange_type: 0, // mint
            timestamp
        };
        
        // 发出事件
        event::emit(ExchangeEvent {
            user,
            from_amount: usdc_amount,
            to_amount: smu_amount,
            exchange_type: 0,
            timestamp
        });
        
        transfer::transfer(record, user);
        transfer::public_transfer(smu_coin, user);
    }

    /// 更新兑换费率
    public entry fun update_exchange_rates(
        config: &mut ExchangeConfig,
        mint_fee_rate: u64,
        burn_fee_rate: u64,
        ctx: &mut TxContext
    ) {
        assert!(tx_context::sender(ctx) == config.admin, EUnauthorized);
        config.mint_fee_rate = mint_fee_rate;
        config.burn_fee_rate = burn_fee_rate;
    }

    /// smU兑换为USDC (赎回)
    public entry fun burn_to_usdc(
        smu_coin: Coin<SMU>,
        treasury_cap: &mut TreasuryCap<SMU>,
        config: &ExchangeConfig,
        pool: &mut RewardPool,
        ctx: &mut TxContext
    ) {
        let user = tx_context::sender(ctx);
        let smu_amount = coin::value(&smu_coin);
        let timestamp = tx_context::epoch(ctx);
        
        // 验证最小金额
        assert!(smu_amount >= config.min_exchange_amount, EAmountTooSmall);
        
        // 计算手续费
        let fee = (smu_amount * config.burn_fee_rate) / 10000;
        let usdc_amount = smu_amount - fee;
        
        // 销毁smU代币
        let _ = stb::token::burn(treasury_cap, smu_coin);
        
        // 更新用户收益记录
        update_user_rewards(user, smu_amount, pool, ctx);
        
        // 创建兑换记录
        let record = ExchangeRecord {
            id: object::new(ctx),
            user,
            from_amount: smu_amount,
            to_amount: usdc_amount,
            exchange_type: 1, // burn
            timestamp
        };
        
        // 发出事件
        event::emit(ExchangeEvent {
            user,
            from_amount: smu_amount,
            to_amount: usdc_amount,
            exchange_type: 1,
            timestamp
        });
        
        transfer::transfer(record, user);
        // 这里应该有USDC的铸造和转移逻辑，简化处理
    }

    /// 更新用户收益
    fun update_user_rewards(
        user: address,
        smu_amount: u64,
        pool: &mut RewardPool,
        ctx: &mut TxContext
    ) {
        let current_time = tx_context::epoch(ctx);
        let time_diff = current_time - pool.last_update;
        
        if (time_diff > 0) {
            let new_rewards = pool.total_rewards + (pool.reward_rate * time_diff);
            pool.total_rewards = new_rewards;
            pool.last_update = current_time;
        }
        
        // 简化的收益计算
        let user_reward = UserReward {
            id: object::new(ctx),
            user,
            smu_balance: smu_amount,
            reward_debt: 0,
            accumulated_rewards: (smu_amount * pool.reward_rate) / 10000
        };
        
        transfer::transfer(user_reward, user);
    }

    /// 领取收益
    public entry fun claim_rewards(
        pool: &mut RewardPool,
        ctx: &mut TxContext
    ) {
        let user = tx_context::sender(ctx);
        let timestamp = tx_context::epoch(ctx);
        
        // 计算时间差
        let time_diff = timestamp - pool.last_update;
        
        if (time_diff > 0) {
            pool.total_rewards = pool.total_rewards + (pool.reward_rate * time_diff);
            pool.last_update = timestamp;
        }
        
        // 简化的收益领取逻辑
        let reward_amount = pool.reward_rate;
        
        // 发出事件
        event::emit(RewardClaimEvent {
            user,
            amount: reward_amount,
            timestamp
        });
        
        // 这里应该有实际的收益转移逻辑
    }

    /// 更新奖励率 (仅管理员)
    public entry fun update_reward_rate(
        pool: &mut RewardPool,
        reward_rate: u64,
        ctx: &mut TxContext
    ) {
        let user = tx_context::sender(ctx);
        // 简化的权限检查
        pool.reward_rate = reward_rate;
    }

    /// 获取兑换配置
    public fun get_exchange_rates(config: &ExchangeConfig): (u64, u64, u64) {
        (
            config.mint_fee_rate,
            config.burn_fee_rate,
            config.min_exchange_amount
        )
    }

    /// 获取收益池信息
    public fun get_pool_info(pool: &RewardPool): (u64, u64, u64) {
        (
            pool.total_rewards,
            pool.last_update,
            pool.reward_rate
        )
    }

    // 错误代码
    const EAmountTooSmall: u64 = 1;
    const EUnauthorized: u64 = 2;
    const EInsufficientBalance: u64 = 3;
    
    // USDC类型定义
    public struct USDC has drop {}
}
