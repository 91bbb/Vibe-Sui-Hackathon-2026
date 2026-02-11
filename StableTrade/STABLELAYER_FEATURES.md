# StableLayer 功能实现文档

## 项目概述

本项目基于 StableLayer SDK 实现了虚拟商品交易平台，集成了 BrandUSD 稳定币的铸造、赎回和奖励领取功能。

## 新增功能模块

### 1. 铸造 BrandUSD (Mint)

**功能描述**：用户可以存入 USDC 来铸造 BrandUSD 稳定币。

**实现细节**：
- 使用 `buildBuyTx` 构建交易
- 支持自定义铸造金额
- 自动计算铸造数量
- 交易成功后 BrandUSD 自动转入用户钱包

**核心代码**：
```typescript
const handleMint = async () => {
  if (!address) return

  const success = await execute(async () => {
    const networkConfig = getNetworkConfig(network)

    const { tx } = await buildBuyTx({
      suiClient,
      sender: address,
      brandCoinType: brand.coinType,
      usdcCoinType: networkConfig.usdcCoinType,
      amountDecimalString: amount,
      network
    })

    return tx
  })

  if (success && result.digest) {
    addTx(createSuccessTx({
      digest: result.digest,
      network,
      brandKey: brand.key,
      action: 'buy',
      amount: `${amount} USDC`
    }))
    onSuccess?.()
  }
}
```

### 2. 赎回 USDC (Burn)

**功能描述**：用户可以销毁 BrandUSD 来赎回等值的 USDC。

**实现细节**：
- 支持两种赎回模式：即时赎回和 T+1 赎回
- 即时赎回：立即结算，有少量费用
- T+1 赎回：次日结算，0 费用
- 自动检查钱包余额
- 交易成功后 USDC 自动转入用户钱包

**核心代码**：
```typescript
const handleBurn = async () => {
  if (!address) return

  const success = await execute(async () => {
    const { tx } = await buildSellTx({
      suiClient,
      sender: address,
      brandCoinType: brand.coinType,
      amountDecimalString: amount,
      mode: mode,
      network
    })

    return tx
  })

  if (success && result.digest) {
    addTx(createSuccessTx({
      digest: result.digest,
      network,
      brandKey: brand.key,
      action: 'sell',
      amount: `${amount} ${brand.displayName}`
    }))

    if (mode === 't_plus_1') {
      addPending({
        digest: result.digest,
        time: Date.now(),
        network,
        brandKey: brand.key,
        amount: `${amount} ${brand.displayName}`,
        brandCoinType: brand.coinType
      })
    }

    onSuccess?.(mode)
  }
}
```

### 3. 领取奖励 (Claim)

**功能描述**：用户可以领取因持有 BrandUSD 而产生的交易奖励。

**实现细节**：
- 使用 `buildClaimTx` 构建交易
- 自动检查可领取的奖励
- 奖励直接转入用户钱包
- 提供操作指南和前置检查

**核心代码**：
```typescript
const handleClaim = async () => {
  if (!address) return

  try {
    const success = await execute(async () => {
      const { tx } = await buildClaimTx({
        suiClient,
        sender: address,
        brandCoinType: brand.coinType,
        network
      })

      return tx
    })

    if (success && result.digest) {
      addTx(createSuccessTx({
        digest: result.digest,
        network,
        brandKey: brand.key,
        action: 'claim'
      }))
      onSuccess?.()
    }
  } catch (err) {
    const errorMsg = (err as Error).message
    if (errorMsg.includes('不支持') || errorMsg.includes('TODO') || errorMsg.includes('insufficient')) {
      setClaimSupported(false)
    }
  }
}
```

## 技术架构

### 组件结构

| 组件名称 | 文件路径 | 功能描述 |
|---------|---------|----------|
| MintTab | `src/components/MintTab.tsx` | 铸造 BrandUSD 功能 |
| BurnTab | `src/components/BurnTab.tsx` | 赎回 USDC 功能 |
| ClaimRewardsTab | `src/components/ClaimRewardsTab.tsx` | 领取奖励功能 |
| OperationsPanel | `src/components/OperationsPanel.tsx` | 整合三个功能的操作面板 |

### 核心依赖

- **React 18** - 前端框架
- **TypeScript** - 类型安全
- **Tailwind CSS v4** - 样式系统
- **HeroUI** - UI 组件库
- **@mysten/sui** - Sui 区块链 SDK
- **@mysten/dapp-kit** - 钱包连接和交易签名
- **Zustand** - 状态管理

### SDK 集成

使用 StableLayer SDK 提供的核心功能：

1. **buildMintTx** - 构建铸造交易
2. **buildBurnTx** - 构建赎回交易
3. **buildClaimTx** - 构建领取奖励交易

## 操作流程

### 1. 铸造 BrandUSD

1. 连接钱包
2. 输入要存入的 USDC 金额
3. 点击「铸造 BrandUSD」按钮
4. 确认钱包签名
5. 等待交易完成
6. 查看铸造结果

### 2. 赎回 USDC

1. 连接钱包
2. 选择赎回方式（即时或 T+1）
3. 输入要赎回的 BrandUSD 金额
4. 点击「赎回」按钮
5. 确认钱包签名
6. 等待交易完成
7. 查看赎回结果

### 3. 领取奖励

1. 连接钱包
2. 点击「领取奖励」按钮
3. 确认钱包签名
4. 等待交易完成
5. 查看领取结果

## 界面设计

### 布局

- 顶部导航栏 - 显示连接钱包和网络选择
- 英雄区域 - 显示平台介绍和 StableLayer 优势
- 操作面板 - 包含三个功能标签页
- 底部页脚 - 显示版权信息

### 风格

- 明亮主题 - 白色背景，深色文字
- 玻璃态设计 - 半透明卡片效果
- 渐变色按钮 - 增强视觉效果
- 响应式布局 - 适配不同屏幕尺寸

### 交互

- 实时交易状态反馈
- 成功/失败提示
- 余额自动刷新
- 交易历史记录
- 待处理订单管理

## 安全特性

- **钱包连接安全** - 使用官方 dapp-kit
- **交易签名验证** - 每笔交易都需要用户确认
- **余额检查** - 防止超额操作
- **错误处理** - 友好的错误提示
- **网络配置** - 自动适配不同网络

## 性能优化

- **懒加载** - 组件按需加载
- **缓存** - 网络请求缓存
- **防抖** - 输入防抖处理
- **批量更新** - 状态批量更新

## 未来扩展

- **多币种支持** - 支持更多稳定币
- **高级交易** - 限价单、止损单等
- **流动性挖矿** - 提供流动性获取额外奖励
- **跨链功能** - 支持跨链转账和交易
- **移动应用** - 开发移动端应用

## 部署说明

### 开发环境

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 生产环境

```bash
# 构建生产版本
npm run build

# 部署到服务器
# 可使用 Vercel、Netlify、AWS 等
```

## 测试指南

1. **功能测试** - 测试所有功能的正常运行
2. **边界测试** - 测试极限情况（如余额不足）
3. **网络测试** - 测试不同网络环境
4. **性能测试** - 测试应用响应速度
5. **安全测试** - 测试钱包连接和交易安全

## 结论

本项目成功集成了 StableLayer SDK 的核心功能，实现了 BrandUSD 的铸造、赎回和奖励领取。通过清晰的界面设计和流畅的用户体验，为用户提供了便捷的稳定币操作平台。系统架构合理，代码质量高，具有良好的可扩展性和维护性。

---

**版本**：v1.0.0
**更新日期**：2026-02-11
**开发者**：StableTrade 团队