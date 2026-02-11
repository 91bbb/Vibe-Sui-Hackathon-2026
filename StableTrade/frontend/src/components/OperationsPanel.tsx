import { useState } from 'react'
import { MintTab } from './MintTab'
import { BurnTab } from './BurnTab'
import { ClaimRewardsTab } from './ClaimRewardsTab'

type TabKey = 'mint' | 'burn' | 'claim'

export function OperationsPanel() {
  const [activeTab, setActiveTab] = useState<TabKey>('mint')

  return (
    <section className="relative py-12">
      <div className="max-w-5xl mx-auto px-4 space-y-8">
        <div className="text-center mb-12">
          <h2
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ color: 'var(--text)' }}
          >
            StableLayer 操作
          </h2>
          <p
            className="text-lg"
            style={{ color: 'var(--text-muted)' }}
          >
            铸造 BrandUSD、赎回 USDC、领取收益奖励
          </p>
        </div>

        <div className="flex gap-3 mb-8 border-b pb-4" style={{ borderColor: 'var(--border)' }}>
          {
            [
              { key: 'mint' as const, label: '铸造 BrandUSD', icon: '💰' },
              { key: 'burn' as const, label: '赎回 USDC', icon: '🔥' },
              { key: 'claim' as const, label: '领取奖励', icon: '🎁' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 h-14 text-base font-medium rounded-xl transition-all duration-200 ${
                  activeTab === tab.key
                    ? 'btn-gradient'
                    : 'btn-ghost'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))
          }
        </div>

        <div className="min-h-[400px]">
          {activeTab === 'mint' && <MintTab />}
          {activeTab === 'burn' && <BurnTab />}
          {activeTab === 'claim' && <ClaimRewardsTab />}
        </div>

        <div className="glass-panel rounded-2xl p-8 text-left mt-12">
          <h3
            className="text-xl font-bold mb-4 text-center"
            style={{ color: 'var(--text)' }}
          >
            StableLayer SDK 功能说明
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {
              [
                {
                  title: 'buildMintTx',
                  desc: '使用 USDC 铸造 BrandUSD 稳定币。SDK 会自动构建交易，通过 Stable Layer 铸造并存入金库农场。',
                  code: 'await client.buildMintTx({ tx, stableCoinType, usdcCoin, amount })'
                },
                {
                  title: 'buildBurnTx',
                  desc: '销毁 BrandUSD 以赎回 USDC。可以选择赎回特定数量或全部余额。',
                  code: 'await client.buildBurnTx({ tx, stableCoinType, amount })'
                },
                {
                  title: 'buildClaimTx',
                  desc: '领取累积的收益奖励。所有基础收益归您所有，可随时领取。',
                  code: 'await client.buildClaimTx({ tx, stableCoinType })'
                }
              ].map((api) => (
                <div
                  key={api.title}
                  className="glass-card rounded-xl p-4 transition-all duration-200 hover:scale-[1.02]"
                >
                  <h4
                    className="text-base font-bold mb-2"
                    style={{ color: 'var(--text)' }}
                  >
                    {api.title}
                  </h4>
                  <p
                    className="text-sm leading-relaxed mb-3"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {api.desc}
                  </p>
                  <div
                    className="p-3 rounded-lg text-xs font-mono"
                    style={{
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-dim)'
                    }}
                  >
                    {api.code}
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </section>
  )
}
