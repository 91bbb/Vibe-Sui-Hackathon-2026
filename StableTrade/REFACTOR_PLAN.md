# StableLayer-quickstart 虚拟商品交易项目改造计划

## 1. 项目概述

本计划基于 [StableLayer-quickstart](https://github.com/StarryDeserts/StableLayer-quickstart) 仓库，改造现有的 StableTrade 虚拟商品交易平台前端，采用更现代的技术栈和更优秀的 UI 设计。

## 2. 技术栈对比

### 2.1 StableLayer-quickstart 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| 构建工具 | Vite 6 | 现代化构建工具，开发体验更好 |
| 框架 | React 19 | 最新版本，性能优化 |
| 语言 | TypeScript | 类型安全 |
| UI 组件库 | HeroUI v3 (beta) | 现代化 UI 组件库 |
| 样式 | Tailwind CSS v4 | 最新版本，性能优化 |
| 钱包适配器 | @mysten/dapp-kit | 官方 Sui 钱包适配器 |
| Sui SDK | @mysten/sui | 官方 Sui SDK |
| StableLayer SDK | stable-layer-sdk | StableLayer 官方 SDK |
| 状态管理 | Zustand | 轻量级状态管理 |
| 数据获取 | React Query | 强大的数据同步和缓存 |

### 2.2 当前 StableTrade 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| 构建工具 | Next.js 14 | 服务端渲染框架 |
| 框架 | React 18 | 稳定版本 |
| 语言 | TypeScript | 类型安全 |
| 样式 | Tailwind CSS v3 | 稳定版本 |
| 钱包适配器 | @suiet/wallet-kit | 第三方钱包适配器 |
| Sui SDK | @mysten/sui | 官方 Sui SDK |
| StableLayer SDK | stable-layer-sdk | StableLayer 官方 SDK |
| 状态管理 | Zustand | 轻量级状态管理 |

## 3. 改造方案

### 3.1 方案选择

**推荐方案：保留 Next.js 框架，升级依赖和 UI**

**理由**：
1. Next.js 14 已经非常成熟，支持 SSR/SSG，对 SEO 友好
2. 当前项目已有完整的 Next.js 架构
3. 可以升级到 React 19 和 Tailwind CSS v4
4. 可以切换到 @mysten/dapp-kit（官方推荐）
5. 可以引入 React Query 进行数据管理
6. 可以参考 StableLayer-quickstart 的 UI 设计和交互流程

### 3.2 改造步骤

#### 第一步：升级依赖

```bash
# 升级 React 到 19
npm install react@19 react-dom@19

# 升级 Tailwind CSS 到 v4
npm install tailwindcss@4 postcss@8 autoprefixer@10

# 切换钱包适配器到 @mysten/dapp-kit
npm uninstall @suiet/wallet-kit
npm install @mysten/dapp-kit

# 安装 React Query
npm install @tanstack/react-query

# 升级其他依赖
npm install @mysten/sui@latest stable-layer-sdk@latest zustand@latest
```

#### 第二步：更新配置文件

**1. 更新 `tailwind.config.ts`**

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
      },
    },
  },
  plugins: [],
};

export default config;
```

**2. 更新 `next.config.js`**

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.externals.push({
      'utf-8-validate': 'commonjs utf-8-validate',
      'bufferutil': 'commonjs bufferutil',
    });
    return config;
  },
};

module.exports = nextConfig;
```

#### 第三步：创建配置文件

**1. 创建 `src/config/networks.ts`**

```typescript
export const NETWORKS = {
  mainnet: {
    name: 'mainnet',
    rpcUrl: 'https://fullnode.mainnet.sui.io',
    explorerUrl: 'https://suiscan.xyz',
  },
  testnet: {
    name: 'testnet',
    rpcUrl: 'https://fullnode.testnet.sui.io',
    explorerUrl: 'https://suiscan.xyz/testnet',
  },
} as const;

export type Network = keyof typeof NETWORKS;

export const DEFAULT_NETWORK: Network = 'testnet';
```

**2. 创建 `src/config/brands.ts`**

```typescript
export const BRANDS = {
  btcUSDC: {
    name: 'btcUSDC',
    symbol: 'btcUSDC',
    decimals: 6,
    description: 'Bitcoin-backed USDC Stablecoin',
  },
  smU: {
    name: 'smU',
    symbol: 'smU',
    decimals: 6,
    description: 'StableMarket Utility Token',
  },
} as const;

export type Brand = keyof typeof BRANDS;

export const DEFAULT_BRAND: Brand = 'smU';
```

**3. 创建 `src/config/stablelayer.ts`**

```typescript
import { NETWORKS, type Network } from './networks';
import { BRANDS, type Brand } from './brands';

export const STABLELAYER_CONFIG = {
  mainnet: {
    packageId: process.env.NEXT_PUBLIC_STABLELAYER_PACKAGE_ID || '0x...',
    registryId: process.env.NEXT_PUBLIC_STABLELAYER_REGISTRY_ID || '0x...',
    registryInitialSharedVersion: parseInt(
      process.env.NEXT_PUBLIC_STABLELAYER_REGISTRY_INITIAL_SHARED_VERSION || '0'
    ),
  },
  testnet: {
    packageId: process.env.NEXT_PUBLIC_STABLELAYER_PACKAGE_ID_TESTNET || '0x...',
    registryId: process.env.NEXT_PUBLIC_STABLELAYER_REGISTRY_ID_TESTNET || '0x...',
    registryInitialSharedVersion: parseInt(
      process.env.NEXT_PUBLIC_STABLELAYER_REGISTRY_INITIAL_SHARED_VERSION_TESTNET || '0'
    ),
  },
} as const;

export function getStableLayerConfig(network: Network) {
  return STABLELAYER_CONFIG[network];
}

export const USDC_COIN_TYPE = process.env.NEXT_PUBLIC_USDC_COIN_TYPE || '0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN';
export const BTC_USDC_COIN_TYPE = process.env.NEXT_PUBLIC_BTC_USDC_COIN_TYPE || '0x6d9fc...::btc_usdc::BtcUSDC';
```

#### 第四步：重构钱包连接

**1. 创建 `src/hooks/useWallet.ts`**

```typescript
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';

export function useWallet() {
  const account = useCurrentAccount();
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const suiClient = useSuiClient();

  const isConnected = !!account;
  const address = account?.address;

  const signAndExecute = async (transaction: Transaction) => {
    if (!account) {
      throw new Error('Wallet not connected');
    }

    const result = await signAndExecuteTransaction(
      {
        transaction,
      },
      {
        requestType: 'waitForLocalExecution',
      }
    );

    return result;
  };

  return {
    isConnected,
    address,
    account,
    signAndExecute,
    suiClient,
  };
}
```

**2. 创建 `src/components/WalletConnectButton.tsx`**

```typescript
"use client";

import { ConnectButton, useConnectModal } from '@mysten/dapp-kit';
import { Button } from './ui/button';

export default function WalletConnectButton() {
  const { open } = useConnectModal();

  return (
    <ConnectButton
      connectText="连接钱包"
      className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
    />
  );
}
```

#### 第五步：重构 StableLayer 集成

**1. 更新 `src/lib/stablelayer.ts`**

```typescript
import { Transaction } from "@mysten/sui/transactions";
import { StableLayerClient } from "stable-layer-sdk";
import { getNetwork } from "@/config/networks";
import { getStableLayerConfig } from "@/config/stablelayer";
import { DEFAULT_BRAND } from "@/config/brands";

const STABLE_DECIMALS = 6;

export async function buildMintTransaction({
  usdcAmount,
  sender,
}: {
  usdcAmount: number;
  sender: string;
}): Promise<Transaction> {
  const network = getNetwork();
  const amountInBase = BigInt(Math.floor(usdcAmount * 10 ** STABLE_DECIMALS));
  const config = getStableLayerConfig(network);

  const tx = new Transaction();
  tx.setSender(sender);

  const client = new StableLayerClient({
    network,
    sender,
  });

  await client.buildMintTx({
    tx,
    lpToken: DEFAULT_BRAND,
    usdcCoin: tx.pure.address(sender),
    amount: amountInBase,
    sender,
    autoTransfer: true,
  });

  return tx;
}

export async function buildBurnTransaction({
  stableAmount,
  sender,
}: {
  stableAmount: number;
  sender: string;
}): Promise<Transaction> {
  const network = getNetwork();
  const amountInBase = BigInt(Math.floor(stableAmount * 10 ** STABLE_DECIMALS));

  const tx = new Transaction();
  tx.setSender(sender);

  const client = new StableLayerClient({
    network,
    sender,
  });

  await client.buildBurnTx({
    tx,
    lpToken: DEFAULT_BRAND,
    amount: amountInBase,
    sender,
    autoTransfer: true,
  });

  return tx;
}

export async function buildClaimTransaction({
  sender,
}: {
  sender: string;
}): Promise<Transaction> {
  const network = getNetwork();

  const tx = new Transaction();
  tx.setSender(sender);

  const client = new StableLayerClient({
    network,
    sender,
  });

  await client.buildClaimTx({
    tx,
    lpToken: DEFAULT_BRAND,
    sender,
    autoTransfer: true,
  });

  return tx;
}
```

#### 第六步：重构 UI 组件

**1. 创建 `src/components/ui/button.tsx`**

```typescript
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-indigo-600 text-white hover:bg-indigo-700",
        destructive: "bg-red-600 text-white hover:bg-red-700",
        outline: "border border-gray-300 bg-transparent hover:bg-gray-100",
        secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300",
        ghost: "hover:bg-gray-100",
        link: "text-indigo-600 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
```

**2. 创建 `src/components/ui/card.tsx`**

```typescript
import * as React from "react";
import { cn } from "@/lib/utils";

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

export { Card, CardHeader, CardTitle, CardContent };
```

**3. 创建 `src/components/ui/input.tsx`**

```typescript
import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:bg-gray-950 dark:ring-offset-gray-950 dark:placeholder:text-gray-400 dark:focus-visible:ring-indigo-500",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
```

**4. 创建 `src/lib/utils.ts`**

```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

#### 第七步：重构核心组件

**1. 更新 `src/components/StableLayerRecharge.tsx`**

```typescript
"use client";

import { useState } from "react";
import { useWallet } from "@/hooks/useWallet";
import { buildMintTransaction } from "@/lib/stablelayer";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export default function StableLayerRecharge() {
  const { isConnected, address, signAndExecute } = useWallet();
  const [amount, setAmount] = useState("1");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleRecharge = async () => {
    if (!isConnected || !address) {
      setError("请先连接钱包");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const tx = await buildMintTransaction({
        usdcAmount: parseFloat(amount),
        sender: address,
      });

      const result = await signAndExecute(tx);

      setSuccess(`充值成功！交易哈希: ${result.digest.substring(0, 10)}...`);
      setAmount("1");
    } catch (err) {
      setError(`充值失败: ${err instanceof Error ? err.message : "未知错误"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>稳定币充值</CardTitle>
      </CardHeader>
      <CardContent>
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
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0.01"
              step="0.01"
              placeholder="输入充值金额"
            />
          </div>
          
          <div className="text-sm text-gray-600 dark:text-gray-400">
            1 USDC = 1 smU (平台代币)
          </div>

          <Button
            onClick={handleRecharge}
            disabled={loading || !isConnected}
            className="w-full"
          >
            {loading ? "处理中..." : "确认充值"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

**2. 更新 `src/components/StableLayerBurn.tsx`**

```typescript
"use client";

import { useState } from "react";
import { useWallet } from "@/hooks/useWallet";
import { buildBurnTransaction } from "@/lib/stablelayer";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export default function StableLayerBurn() {
  const { isConnected, address, signAndExecute } = useWallet();
  const [amount, setAmount] = useState("1");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleBurn = async () => {
    if (!isConnected || !address) {
      setError("请先连接钱包");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const tx = await buildBurnTransaction({
        stableAmount: parseFloat(amount),
        sender: address,
      });

      const result = await signAndExecute(tx);

      setSuccess(`赎回成功！交易哈希: ${result.digest.substring(0, 10)}...`);
      setAmount("1");
    } catch (err) {
      setError(`赎回失败: ${err instanceof Error ? err.message : "未知错误"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>稳定币赎回</CardTitle>
      </CardHeader>
      <CardContent>
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
              赎回金额 (smU)
            </label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0.01"
              step="0.01"
              placeholder="输入赎回金额"
            />
          </div>
          
          <div className="text-sm text-gray-600 dark:text-gray-400">
            1 smU = 1 USDC (T+1 结算)
          </div>

          <Button
            onClick={handleBurn}
            disabled={loading || !isConnected}
            className="w-full"
          >
            {loading ? "处理中..." : "确认赎回"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

**3. 更新 `src/components/StableLayerClaim.tsx`**

```typescript
"use client";

import { useState } from "react";
import { useWallet } from "@/hooks/useWallet";
import { buildClaimTransaction } from "@/lib/stablelayer";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export default function StableLayerClaim() {
  const { isConnected, address, signAndExecute } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleClaim = async () => {
    if (!isConnected || !address) {
      setError("请先连接钱包");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const tx = await buildClaimTransaction({
        sender: address,
      });

      const result = await signAndExecute(tx);

      setSuccess(`收益领取成功！交易哈希: ${result.digest.substring(0, 10)}...`);
    } catch (err) {
      setError(`收益领取失败: ${err instanceof Error ? err.message : "未知错误"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>收益领取</CardTitle>
      </CardHeader>
      <CardContent>
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

          <Button
            onClick={handleClaim}
            disabled={loading || !isConnected}
            className="w-full"
          >
            {loading ? "处理中..." : "领取收益"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

#### 第八步：重构市场组件

**1. 更新 `src/components/Marketplace.tsx`**

```typescript
"use client";

import { useState } from "react";
import { useWallet } from "@/hooks/useWallet";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface VirtualItem {
  id: string;
  owner: string;
  name: string;
  description: string;
  category: number;
  price: number;
  isListed: boolean;
  metadata_uri: string;
}

export default function Marketplace() {
  const { isConnected } = useWallet();
  const [items, setItems] = useState<VirtualItem[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<VirtualItem | null>(null);

  const handleCreateItem = async (itemData: {
    name: string;
    description: string;
    category: number;
    metadata_uri: string;
  }) => {
    if (!isConnected) {
      alert("请先连接钱包");
      return;
    }
    
    console.log("创建商品:", itemData);
    setShowCreateModal(false);
  };

  const handleBuyItem = async (item: VirtualItem) => {
    if (!isConnected) {
      alert("请先连接钱包");
      return;
    }
    
    console.log("购买商品:", item);
  };

  const handleListItem = async (item: VirtualItem, price: number) => {
    if (!isConnected) {
      alert("请先连接钱包");
      return;
    }
    
    console.log("上架商品:", item, "价格:", price);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>虚拟商品市场</CardTitle>
          <Button onClick={() => setShowCreateModal(true)}>
            创建商品
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              暂无商品，创建第一个商品吧！
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <div
                key={item.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-4xl">🎮</span>
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {item.name}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {item.description}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                    {item.price} smU
                  </span>
                  {item.isListed ? (
                    <Button
                      onClick={() => handleBuyItem(item)}
                      size="sm"
                      variant="default"
                    >
                      购买
                    </Button>
                  ) : (
                    <Button
                      onClick={() => setSelectedItem(item)}
                      size="sm"
                      variant="secondary"
                    >
                      上架
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {showCreateModal && (
          <CreateItemModal
            onClose={() => setShowCreateModal(false)}
            onCreate={handleCreateItem}
          />
        )}

        {selectedItem && (
          <ListItemModal
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
            onList={handleListItem}
          />
        )}
      </CardContent>
    </Card>
  );
}

function CreateItemModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (data: {
    name: string;
    description: string;
    category: number;
    metadata_uri: string;
  }) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(0);
  const [metadataUri, setMetadataUri] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({
      name,
      description,
      category,
      metadata_uri: metadataUri,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="max-w-md w-full mx-4">
        <CardHeader>
          <CardTitle>创建虚拟商品</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                商品名称
              </label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                商品描述
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                商品类别
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              >
                <option value={0}>NFT</option>
                <option value={1}>游戏道具</option>
                <option value={2}>虚拟地产</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                元数据 URI
              </label>
              <Input
                type="text"
                value={metadataUri}
                onChange={(e) => setMetadataUri(e.target.value)}
                placeholder="https://example.com/metadata/123"
              />
            </div>
            <div className="flex space-x-3">
              <Button
                type="button"
                onClick={onClose}
                variant="secondary"
                className="flex-1"
              >
                取消
              </Button>
              <Button
                type="submit"
                className="flex-1"
              >
                创建
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function ListItemModal({
  item,
  onClose,
  onList,
}: {
  item: VirtualItem;
  onClose: () => void;
  onList: (item: VirtualItem, price: number) => void;
}) {
  const [price, setPrice] = useState("1");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onList(item, parseFloat(price));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="max-w-md w-full mx-4">
        <CardHeader>
          <CardTitle>上架商品</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            商品: {item.name}
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                价格 (smU)
              </label>
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                min="0.01"
                step="0.01"
                required
              />
            </div>
            <div className="flex space-x-3">
              <Button
                type="button"
                onClick={onClose}
                variant="secondary"
                className="flex-1"
              >
                取消
              </Button>
              <Button
                type="submit"
                className="flex-1"
              >
                上架
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

#### 第九步：更新布局

**1. 更新 `src/app/layout.tsx`**

```typescript
"use client";

import '@mysten/dapp-kit/index.css';
import { SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { networkConfig } from '@/config/networks';

const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <head>
        <title>StableTrade - 虚拟商品交易平台</title>
        <meta name="description" content="基于 Sui 区块链和 StableLayer SDK 的虚拟商品交易平台" />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
            <WalletProvider>
              {children}
            </WalletProvider>
          </SuiClientProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
```

**2. 更新 `src/app/page.tsx`**

```typescript
"use client";

import WalletConnectButton from "@/components/WalletConnectButton";
import StableLayerRecharge from "@/components/StableLayerRecharge";
import StableLayerBurn from "@/components/StableLayerBurn";
import StableLayerClaim from "@/components/StableLayerClaim";
import Marketplace from "@/components/Marketplace";
import { useState } from "react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"home" | "market">("home");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <nav className="bg-white dark:bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                StableTrade
              </h1>
              <div className="flex space-x-4">
                <button
                  onClick={() => setActiveTab("home")}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    activeTab === "home"
                      ? "bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  首页
                </button>
                <button
                  onClick={() => setActiveTab("market")}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    activeTab === "market"
                      ? "bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  市场
                </button>
              </div>
            </div>
            <WalletConnectButton />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {activeTab === "home" ? (
          <>
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                虚拟商品交易平台
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                基于 Sui 区块链和 StableLayer SDK
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    StableLayer 核心特性
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    利用 StableLayer SDK 构建安全、高效的稳定币交易生态
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-2xl">💰</span>
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                        稳定币充值
                      </h4>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      支持 USDC、USDT 等主流稳定币充值，即时到账，零手续费
                    </p>
                  </div>

                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-2xl">🔄</span>
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                        代币兑换
                      </h4>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      USDC 充值自动转换为平台代币 smU，1:1 汇率，无滑点，T+1赎回
                    </p>
                  </div>

                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-2xl">📈</span>
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                        收益挖矿
                      </h4>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      持有 smU 代币自动获得收益，每日结算，随时提现
                    </p>
                    <div className="text-xs text-indigo-600 dark:text-indigo-400 space-y-1">
                      <div>• 年化收益率：5-15%（浮动）</div>
                      <div>• 提现无手续费</div>
                    </div>
                  </div>

                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-2xl">🔒</span>
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                        安全保障
                      </h4>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      智能合约审计，多重签名机制，资金安全有保障
                    </p>
                  </div>

                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-2xl">⚡</span>
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                        高速交易
                      </h4>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      基于 Sui 区块链的高并发处理能力，秒级确认
                    </p>
                  </div>

                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-2xl">🎮</span>
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                        虚拟商品
                      </h4>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      支持 NFT、游戏道具、虚拟地产等多种虚拟商品交易
                    </p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    🚀 为什么选择 StableLayer？
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li className="flex items-start">
                      <span className="text-indigo-500 mr-2">•</span>
                      <span>去中心化协议，无需第三方托管，完全掌控自己的资产</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-indigo-500 mr-2">•</span>
                      <span>低 Gas 费，高吞吐量，交易成本降低 90% 以上</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-indigo-500 mr-2">•</span>
                      <span>智能合约自动执行，透明可查，杜绝人为干预</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-indigo-500 mr-2">•</span>
                      <span>跨链兼容，支持多种区块链网络</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-6">
                  <StableLayerRecharge />
                </div>

                <div className="mt-6">
                  <StableLayerBurn />
                </div>

                <div className="mt-6">
                  <StableLayerClaim />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
                <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
                  0.01
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  最小充值金额 (USDC)
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
                <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
                  1:1
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  USDC 兑换 smU 汇率
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
                <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                  24/7
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  全天候交易支持
                </div>
              </div>
            </div>
          </>
        ) : (
          <Marketplace />
        )}
      </main>
    </div>
  );
}
```

#### 第十步：更新 package.json

```json
{
  "name": "stablemarket-frontend",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@mysten/dapp-kit": "^1.0.1",
    "@mysten/sui": "1.45.2",
    "@tanstack/react-query": "^5.0.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "next": "^14.2.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "stable-layer-sdk": "^2.0.0",
    "tailwind-merge": "^2.2.0",
    "zustand": "^4.5.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "autoprefixer": "^10.4.0",
    "eslint": "^8.57.0",
    "eslint-config-next": "^14.2.0",
    "postcss": "^8.4.0",
    "tailwindcss": "^4.0.0",
    "typescript": "^5.4.0"
  }
}
```

#### 第十一步：更新 .env.example

```env
# Network Configuration
NEXT_PUBLIC_SUI_NETWORK=testnet

# StableLayer Configuration
NEXT_PUBLIC_STABLELAYER_PACKAGE_ID=0x...
NEXT_PUBLIC_STABLELAYER_REGISTRY_ID=0x...
NEXT_PUBLIC_STABLELAYER_REGISTRY_INITIAL_SHARED_VERSION=0

# Testnet Configuration
NEXT_PUBLIC_STABLELAYER_PACKAGE_ID_TESTNET=0x...
NEXT_PUBLIC_STABLELAYER_REGISTRY_ID_TESTNET=0x...
NEXT_PUBLIC_STABLELAYER_REGISTRY_INITIAL_SHARED_VERSION_TESTNET=0

# Coin Types
NEXT_PUBLIC_USDC_COIN_TYPE=0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN
NEXT_PUBLIC_BTC_USDC_COIN_TYPE=0x6d9fc...::btc_usdc::BtcUSDC
NEXT_PUBLIC_BRAND_COIN_TYPE=0x...::smu::smU

# RPC URL (optional, will use default if not set)
NEXT_PUBLIC_SUI_RPC_URL=https://fullnode.testnet.sui.io
```

## 4. 改造优势

### 4.1 技术优势

1. **React 19**: 性能优化，更好的并发渲染
2. **Tailwind CSS v4**: 更快的编译速度，更好的性能
3. **@mysten/dapp-kit**: 官方钱包适配器，更好的兼容性和稳定性
4. **React Query**: 强大的数据同步和缓存机制，更好的用户体验
5. **模块化设计**: 更好的代码组织和可维护性

### 4.2 UI/UX 优势

1. **统一的设计系统**: 使用 shadcn/ui 风格的组件库
2. **更好的响应式设计**: 适配各种设备
3. **更流畅的交互**: 优化的加载状态和错误处理
4. **更清晰的信息层级**: 更好的视觉层次和信息组织

### 4.3 开发体验优势

1. **更好的类型安全**: TypeScript 严格模式
2. **更好的代码组织**: 清晰的文件结构
3. **更好的调试体验**: 更清晰的错误信息
4. **更好的文档**: 详细的注释和文档

## 5. 改造风险

### 5.1 技术风险

1. **依赖兼容性**: 新版本依赖可能存在兼容性问题
2. **构建配置**: Tailwind CSS v4 的配置可能有变化
3. **钱包适配器切换**: @mysten/dapp-kit 与 @suiet/wallet-kit 的 API 可能有差异

### 5.2 业务风险

1. **用户习惯改变**: UI 改变可能影响用户习惯
2. **功能回归**: 改造过程中可能引入新的 bug
3. **性能影响**: 新版本可能存在性能问题

## 6. 缓解措施

1. **充分测试**: 在测试环境充分测试所有功能
2. **渐进式迁移**: 可以分阶段迁移，降低风险
3. **回滚计划**: 保留旧版本代码，以便快速回滚
4. **监控告警**: 部署后密切监控，及时发现和解决问题

## 7. 实施时间表

| 阶段 | 任务 | 预计时间 |
|------|------|----------|
| 第一阶段 | 升级依赖和配置 | 2 小时 |
| 第二阶段 | 重构钱包连接 | 2 小时 |
| 第三阶段 | 重构 StableLayer 集成 | 3 小时 |
| 第四阶段 | 重构 UI 组件 | 4 小时 |
| 第五阶段 | 重构市场组件 | 3 小时 |
| 第六阶段 | 测试和修复 | 4 小时 |
| **总计** | | **18 小时** |

## 8. 后续优化建议

1. **添加单元测试**: 使用 Jest 和 React Testing Library
2. **添加 E2E 测试**: 使用 Playwright 或 Cypress
3. **性能优化**: 使用 React DevTools 分析性能
4. **SEO 优化**: 添加 meta 标签和结构化数据
5. **国际化**: 添加多语言支持
6. **主题切换**: 添加深色/浅色主题切换
7. **PWA 支持**: 添加离线支持和推送通知
8. **监控和日志**: 添加错误监控和性能监控

## 9. 总结

本改造计划基于 StableLayer-quickstart 仓库，采用现代化的技术栈和优秀的 UI 设计，对现有的 StableTrade 虚拟商品交易平台进行全面升级。通过升级依赖、重构组件、优化配置，我们将获得更好的性能、更好的用户体验和更好的开发体验。

改造完成后，项目将具备以下特点：
- 更快的构建和加载速度
- 更好的类型安全和代码质量
- 更流畅的用户交互
- 更清晰的信息层级
- 更好的可维护性和可扩展性

---

**创建时间**: 2026-02-10
**状态**: 待执行
