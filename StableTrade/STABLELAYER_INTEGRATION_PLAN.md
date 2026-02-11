# StableLayer SDK 集成计划

## 1. 项目概述

本计划基于 [StableLayer SDK](https://github.com/StableLayer/stable-layer-sdk) 官方文档，实现虚拟商品交易平台的稳定币充值和销毁功能。

## 2. 技术栈

- **前端框架**：Next.js 14 + React 19 + TypeScript
- **区块链**：Sui 区块链
- **钱包集成**：@suiet/wallet-kit
- **StableLayer SDK**：stable-layer-sdk
- **Sui SDK**：@mysten/sui, @mysten/bcs

## 3. 集成步骤

### 3.1 安装依赖

```bash
# 安装 StableLayer SDK 及其依赖
npm install stable-layer-sdk @mysten/sui @mysten/bcs
```

### 3.2 配置 StableLayer Client

创建 `src/lib/stablelayer.ts` 文件，配置 StableLayer 客户端：

```typescript
import { StableLayerClient } from "stable-layer-sdk";
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";

export const suiClient = new SuiClient({
  url: getFullnodeUrl("testnet"),
});

// 初始化 StableLayer 客户端
export const stableLayerClient = new StableLayerClient({
  network: "testnet", // 或 "mainnet"
  sender: "", // 默认发送者地址，可在运行时覆盖
});

// 稳定币类型（根据实际网络配置）
export const STABLE_COIN_TYPE = "0x6d9fc...::btc_usdc::BtcUSDC"; // 示例地址，需替换为实际地址
export const USDC_TYPE = "0xdba34...::usdc::USDC"; // 示例地址，需替换为实际地址
```

### 3.3 实现充值功能

#### 3.3.1 修改 StableLayerRecharge 组件

更新 `src/components/StableLayerRecharge.tsx` 文件，集成 StableLayer SDK：

```typescript
"use client";

import { useState } from "react";
import { useWallet } from "@suiet/wallet-kit";
import { buildMintTransaction } from "@/lib/stablelayer";

export default function StableLayerRecharge() {
  const wallet = useWallet();
  const [amount, setAmount] = useState("1");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleRecharge = async () => {
    if (!wallet.connected || !wallet.address) {
      setError("请先连接钱包");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const tx = await buildMintTransaction({
        usdcAmount: parseFloat(amount),
        sender: wallet.address,
      });

      const result = await wallet.signAndExecuteTransaction({
        transaction: tx,
      });

      setSuccess(`充值成功！交易哈希: ${result.digest.substring(0, 10)}...`);
      setAmount("1");
    } catch (err) {
      setError(`充值失败: ${err instanceof Error ? err.message : "未知错误"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        稳定币充值
      </h3>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm text-green-600 dark:text-green-400">{success}</p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            充值金额 (USDC)
          </label>
          <input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0.01"
            step="0.01"
            placeholder="输入充值金额"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        
        <div className="text-sm text-gray-600 dark:text-gray-400">
          1 USDC = 1 稳定币
        </div>

        <button
          onClick={handleRecharge}
          disabled={loading || !wallet.connected}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? "处理中..." : "确认充值"}
        </button>
      </div>
    </div>
  );
}
```

#### 3.3.2 实现充值交易构建函数

更新 `src/lib/stablelayer.ts` 文件，实现充值交易构建：

```typescript
import { StableLayerClient } from "stable-layer-sdk";
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import { Transaction, coinWithBalance } from "@mysten/sui/transactions";

export const suiClient = new SuiClient({
  url: getFullnodeUrl("testnet"),
});

export const stableLayerClient = new StableLayerClient({
  network: "testnet",
  sender: "",
});

export const STABLE_COIN_TYPE = "0x6d9fc...::btc_usdc::BtcUSDC"; // 需替换为实际地址
export const USDC_TYPE = "0xdba34...::usdc::USDC"; // 需替换为实际地址

export interface MintParams {
  usdcAmount: number;
  sender: string;
}

export async function buildMintTransaction({
  usdcAmount,
  sender,
}: MintParams): Promise<Transaction> {
  const tx = new Transaction();
  
  // 将金额转换为最小单位（USDC 通常有 6 位小数）
  const amountInCents = BigInt(Math.floor(usdcAmount * 1_000_000));
  
  // 构建充值交易
  await stableLayerClient.buildMintTx({
    tx,
    stableCoinType: STABLE_COIN_TYPE,
    usdcCoin: coinWithBalance({
      balance: amountInCents,
      type: USDC_TYPE,
    })(tx),
    amount: amountInCents,
    sender,
  });
  
  return tx;
}
```

### 3.4 实现销毁（赎回）功能

#### 3.4.1 创建 StableLayerBurn 组件

创建 `src/components/StableLayerBurn.tsx` 文件，实现销毁功能：

```typescript
"use client";

import { useState } from "react";
import { useWallet } from "@suiet/wallet-kit";
import { buildBurnTransaction } from "@/lib/stablelayer";

export default function StableLayerBurn() {
  const wallet = useWallet();
  const [amount, setAmount] = useState("1");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleBurn = async () => {
    if (!wallet.connected || !wallet.address) {
      setError("请先连接钱包");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const tx = await buildBurnTransaction({
        stableAmount: parseFloat(amount),
        sender: wallet.address,
      });

      const result = await wallet.signAndExecuteTransaction({
        transaction: tx,
      });

      setSuccess(`赎回成功！交易哈希: ${result.digest.substring(0, 10)}...`);
      setAmount("1");
    } catch (err) {
      setError(`赎回失败: ${err instanceof Error ? err.message : "未知错误"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        稳定币赎回
      </h3>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm text-green-600 dark:text-green-400">{success}</p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            赎回金额 (稳定币)
          </label>
          <input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0.01"
            step="0.01"
            placeholder="输入赎回金额"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        
        <div className="text-sm text-gray-600 dark:text-gray-400">
          1 稳定币 = 1 USDC
        </div>

        <button
          onClick={handleBurn}
          disabled={loading || !wallet.connected}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? "处理中..." : "确认赎回"}
        </button>
      </div>
    </div>
  );
}
```

#### 3.4.2 实现销毁交易构建函数

更新 `src/lib/stablelayer.ts` 文件，实现销毁交易构建：

```typescript
export interface BurnParams {
  stableAmount: number;
  sender: string;
}

export async function buildBurnTransaction({
  stableAmount,
  sender,
}: BurnParams): Promise<Transaction> {
  const tx = new Transaction();
  
  // 将金额转换为最小单位
  const amountInCents = BigInt(Math.floor(stableAmount * 1_000_000));
  
  // 构建销毁交易
  await stableLayerClient.buildBurnTx({
    tx,
    stableCoinType: STABLE_COIN_TYPE,
    amount: amountInCents,
    sender,
  });
  
  return tx;
}
```

### 3.5 实现收益领取功能

#### 3.5.1 创建收益领取组件

创建 `src/components/StableLayerClaim.tsx` 文件：

```typescript
"use client";

import { useState } from "react";
import { useWallet } from "@suiet/wallet-kit";
import { buildClaimTransaction } from "@/lib/stablelayer";

export default function StableLayerClaim() {
  const wallet = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleClaim = async () => {
    if (!wallet.connected || !wallet.address) {
      setError("请先连接钱包");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const tx = await buildClaimTransaction({
        sender: wallet.address,
      });

      const result = await wallet.signAndExecuteTransaction({
        transaction: tx,
      });

      setSuccess(`收益领取成功！交易哈希: ${result.digest.substring(0, 10)}...`);
    } catch (err) {
      setError(`收益领取失败: ${err instanceof Error ? err.message : "未知错误"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        收益领取
      </h3>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm text-green-600 dark:text-green-400">{success}</p>
        </div>
      )}

      <div className="space-y-4">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          领取您的收益挖矿奖励
        </div>

        <button
          onClick={handleClaim}
          disabled={loading || !wallet.connected}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? "处理中..." : "领取收益"}
        </button>
      </div>
    </div>
  );
}
```

#### 3.5.2 实现收益领取交易构建函数

更新 `src/lib/stablelayer.ts` 文件，实现收益领取交易构建：

```typescript
export async function buildClaimTransaction({
  sender,
}: {
  sender: string;
}): Promise<Transaction> {
  const tx = new Transaction();
  
  // 构建收益领取交易
  await stableLayerClient.buildClaimTx({
    tx,
    stableCoinType: STABLE_COIN_TYPE,
    sender,
  });
  
  return tx;
}
```

### 3.6 更新首页布局

更新 `src/app/page.tsx` 文件，添加收益领取组件：

```typescript
"use client";

import WalletConnectButton from "@/components/WalletConnectButton";
import StableLayerRecharge from "@/components/StableLayerRecharge";
import StableLayerBurn from "@/components/StableLayerBurn";
import StableLayerClaim from "@/components/StableLayerClaim";
import Marketplace from "@/components/Marketplace";
import { useState } from "react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"home" | "market">('home');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* 导航栏 */}
      <nav className="bg-white dark:bg-gray-800 shadow-lg">
        {/* 导航栏内容 */}
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {activeTab === "home" ? (
          <>
            {/* 页面标题 */}
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                虚拟商品交易平台
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                基于 Sui 区块链和 StableLayer SDK
              </p>
            </div>

            {/* StableLayer 核心特性 */}
            <div className="grid grid-cols-1 gap-8 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                {/* 特性展示 */}
                {/* ... */}

                {/* 充值组件 */}
                <div className="mt-6">
                  <StableLayerRecharge />
                </div>

                {/* 赎回组件 */}
                <div className="mt-6">
                  <StableLayerBurn />
                </div>

                {/* 收益领取组件 */}
                <div className="mt-6">
                  <StableLayerClaim />
                </div>
              </div>
            </div>

            {/* 关键指标 */}
            {/* ... */}
          </>
        ) : (
          <Marketplace />
        )}
      </main>
    </div>
  );
}
```

## 4. 配置说明

### 4.1 网络配置

- **测试网**：`network: "testnet"`
- **主网**：`network: "mainnet"`

### 4.2 合约地址配置

需要根据实际网络替换以下地址：

- `STABLE_COIN_TYPE`：稳定币类型地址
- `USDC_TYPE`：USDC 代币类型地址

### 4.3 安全注意事项

- **私钥管理**：不要在代码中硬编码私钥
- **地址验证**：在交易前验证用户地址
- **金额验证**：验证输入金额的合法性
- **错误处理**：妥善处理交易失败的情况

## 5. 测试计划

### 5.1 功能测试

1. **钱包连接**：测试钱包连接和断开功能
2. **充值功能**：测试 USDC 充值到稳定币
3. **赎回功能**：测试稳定币赎回为 USDC
4. **收益领取**：测试收益挖矿奖励领取

### 5.2 集成测试

1. **端到端测试**：测试完整的充值-交易-赎回流程
2. **网络测试**：在测试网和主网上分别测试
3. **性能测试**：测试交易确认时间和用户体验

## 6. 部署计划

### 6.1 前端部署

1. **构建**：`npm run build`
2. **部署**：部署到 Vercel、Netlify 或其他静态网站托管服务

### 6.2 智能合约部署

1. **编译**：`sui move build`
2. **部署**：`sui client publish`

## 7. 技术支持

- **StableLayer 文档**：https://docs.stablelayer.org
- **Sui 开发者文档**：https://docs.sui.io
- **GitHub 仓库**：https://github.com/StableLayer/stable-layer-sdk

## 8. 预期成果

- ✅ 集成 StableLayer SDK 到前端应用
- ✅ 实现稳定币充值功能
- ✅ 实现稳定币赎回功能
- ✅ 实现收益挖矿奖励领取功能
- ✅ 提供完整的用户界面
- ✅ 支持测试网和主网部署

## 9. 风险评估

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 合约地址配置错误 | 交易失败 | 仔细核对合约地址，在测试网充分测试 |
| 网络拥堵 | 交易延迟 | 提供交易状态反馈，设置合理的超时机制 |
| 用户操作错误 | 资金损失 | 添加交易确认步骤，提供清晰的操作指引 |
| SDK 版本兼容性 | 功能异常 | 锁定依赖版本，定期更新 |

## 10. 结论

通过集成 StableLayer SDK，我们可以实现稳定币的充值、赎回和收益领取功能，为用户提供安全、高效的稳定币交易体验。本计划详细说明了集成步骤和实现方法，可作为项目开发的参考指南。
