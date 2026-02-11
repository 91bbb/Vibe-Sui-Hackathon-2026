interface HeroProps {
  onVirtualGoodsClick?: () => void
}

export function Hero({ onVirtualGoodsClick }: HeroProps) {
  return (
    <section className="relative py-20 md:py-32">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ background: 'var(--cyan)' }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ background: 'var(--pink)' }}
        />
      </div>

      <div className="relative max-w-4xl mx-auto text-center px-4">
        <div className="inline-block mb-6">
          <div
            className="px-4 py-2 rounded-full text-sm font-medium cursor-pointer transition-all duration-200 hover:scale-[1.05]"
            style={{
              background: 'var(--cyan-subtle)',
              border: '1px solid var(--cyan)',
              color: 'var(--cyan-2)'
            }}
            onClick={onVirtualGoodsClick}
          >
            🛒 虚拟商品商城
          </div>
        </div>

        <h1
          className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
          style={{
            color: 'var(--text)',
            textShadow: '0 0 40px var(--cyan-glow)'
          }}
        >
          StableTrade
          <br />
          <span
            style={{
              background: 'linear-gradient(90deg, var(--cyan) 0%, var(--pink) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              cursor: 'pointer'
            }}
            onClick={onVirtualGoodsClick}
          >
            虚拟商品商城
          </span>
        </h1>

        <p
          className="text-xl md:text-2xl mb-12 max-w-2xl mx-auto leading-relaxed"
          style={{ color: 'var(--text-muted)' }}
        >
          基于 StableLayer 的去中心化虚拟商品商城。
          <br />
          安全、高效地购买、卖出虚拟商品并获取收益。
        </p>

        <div className="grid grid-cols-3 gap-6 md:gap-12 max-w-2xl mx-auto">
          {[
            { label: '铸造商品', value: '1 BrandUSD', icon: '🛍' },
            { label: '赎回商品', value: '1 USDC', icon: '💵' },
            { label: '领取收益', value: '随时领取', icon: '📈' }
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div
                className="text-2xl font-bold mb-1"
                style={{ color: 'var(--cyan)' }}
              >
                {stat.value}
              </div>
              <div className="text-sm" style={{ color: 'var(--text-dim)' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        <div 
          className="mt-16 glass-panel rounded-2xl p-8 text-left cursor-pointer transition-all duration-200 hover:scale-[1.01]"
          onClick={onVirtualGoodsClick}
        >
          <h2
            className="text-2xl font-bold mb-6 text-center"
            style={{ color: 'var(--text)' }}
          >
            热门商品
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: '虚拟黄金',
                price: '1,000 USDC',
                desc: '由 NFT 资产背书的数字黄金，价值稳定',
                icon: '🥇',
                tag: '热门'
              },
              {
                name: '虚拟白银',
                price: '500 USDC',
                desc: '数字白银，适合小额投资',
                icon: '🥈',
                tag: '推荐'
              },
              {
                name: '游戏积分',
                price: '100 USDC',
                desc: '游戏内通用积分，可在多款游戏中使用',
                icon: '🎮',
                tag: '新品'
              }
            ].map((product) => (
              <div
                key={product.name}
                className="glass-card rounded-xl p-5 transition-all duration-200 hover:scale-[1.02] cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="text-4xl">{product.icon}</div>
                  <div
                    className="px-2 py-1 rounded-full text-xs font-bold"
                    style={{
                      background: product.tag === '热门' ? 'var(--pink-subtle)' : product.tag === '推荐' ? 'var(--cyan-subtle)' : 'var(--surface-2)',
                      border: product.tag === '热门' ? '1px solid var(--pink)' : product.tag === '推荐' ? '1px solid var(--cyan)' : '1px solid var(--border)',
                      color: product.tag === '热门' ? 'var(--pink-2)' : product.tag === '推荐' ? 'var(--cyan-2)' : 'var(--text-dim)'
                    }}
                  >
                    {product.tag}
                  </div>
                </div>
                <h3
                  className="text-lg font-bold mb-2"
                  style={{ color: 'var(--text)' }}
                >
                  {product.name}
                </h3>
                <div
                  className="text-xl font-bold mb-2"
                  style={{ color: 'var(--cyan)' }}
                >
                  {product.price}
                </div>
                <p
                  className="text-sm leading-relaxed mb-4"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {product.desc}
                </p>
                <button
                  className="w-full py-3 rounded-xl font-bold text-base transition-all duration-200 hover:scale-[1.02]"
                  style={{
                    background: 'linear-gradient(135deg, var(--cyan) 0%, var(--pink) 100%)',
                    boxShadow: 'var(--glow-cyan)',
                    color: 'var(--bg)'
                  }}
                >
                  立即购买
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 glass-panel rounded-2xl p-8 text-left">
          <h2
            className="text-2xl font-bold mb-6 text-center"
            style={{ color: 'var(--text)' }}
          >
            StableLayer 核心特性
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: '铸造与赎回',
                desc: '任何人都可以用 USDC 铸造 BrandUSD，也可以销毁 BrandUSD 以赎回 USDC。1 BrandUSD = 1 USDC。',
                icon: '🔄'
              },
              {
                title: '灵活赎回方式',
                desc: '即时赎回（有费用，每日上限）或 T+1 赎回（0 费用，次日结算）。当即时赎回达到每日上限时，T+1 赎回始终可用。',
                icon: '⚡'
              },
              {
                title: '收益完全归属',
                desc: '100% 的基础收益归合作伙伴所有。您可以决定如何部署收益以实现增长（激励、回购、运营等）。',
                icon: '💰'
              },
              {
                title: '随时领取收益',
                desc: '收益持续累积，可随时从管理页面领取到您指定的地址。介绍期绩效费用为 0%。',
                icon: '📈'
              },
              {
                title: '自动复利',
                desc: '自动复利基础收益以最大化长期价值，确保您的资产持续增长。',
                icon: '📊'
              },
              {
                title: '完全可定制',
                desc: '名称、符号、小数位完全可定制。可根据您的品牌需求创建专属稳定币。',
                icon: '⚙️'
              }
            ].map((feature) => (
              <div
                key={feature.title}
                className="glass-card rounded-xl p-5 transition-all duration-200 hover:scale-[1.02]"
              >
                <div className="text-4xl mb-3">{feature.icon}</div>
                <h3
                  className="text-lg font-bold mb-2"
                  style={{ color: 'var(--text)' }}
                >
                  {feature.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 glass-panel rounded-2xl p-8 text-left">
          <h2
            className="text-2xl font-bold mb-6 text-center"
            style={{ color: 'var(--text)' }}
          >
            操作指南
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: '充值铸造',
                desc: '存入 USDC 以铸造 BrandUSD 稳定币。SDK 会自动构建交易，通过 Stable Layer 铸造并存入金库农场。',
                icon: '💰',
                steps: [
                  '连接钱包',
                  '选择 USDC 数量',
                  '确认铸造交易',
                  'BrandUSD 自动转入您的钱包'
                ]
              },
              {
                title: '赎回',
                desc: '销毁 BrandUSD 以赎回 USDC。可以选择赎回特定数量或全部余额。',
                icon: '🔥',
                steps: [
                  '选择赎回方式（即时或 T+1）',
                  '输入 BrandUSD 数量',
                  '确认赎回交易',
                  'USDC 即时或次日到账'
                ]
              },
              {
                title: '领取奖励',
                desc: '领取累积的收益奖励。所有基础收益归您所有，可随时领取。',
                icon: '🎁',
                steps: [
                  '查看累积收益',
                  '点击领取奖励',
                  '确认交易',
                  '奖励转入指定地址'
                ]
              }
            ].map((action) => (
              <div
                key={action.title}
                className="glass-card rounded-xl p-5 transition-all duration-200 hover:scale-[1.02]"
              >
                <div className="text-4xl mb-3">{action.icon}</div>
                <h3
                  className="text-lg font-bold mb-2"
                  style={{ color: 'var(--text)' }}
                >
                  {action.title}
                </h3>
                <p
                  className="text-sm leading-relaxed mb-4"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {action.desc}
                </p>
                <div className="space-y-2">
                  {action.steps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <div
                        className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{
                          background: 'var(--cyan-subtle)',
                          color: 'var(--cyan-2)',
                          border: '1px solid var(--cyan)'
                        }}
                      >
                        {idx + 1}
                      </div>
                      <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        {step}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
