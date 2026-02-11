import { Card, Button } from '@heroui/react'
import { usePendingOrders } from '../hooks/usePendingOrders'
import type { PendingOrderItem } from '../types/history'

export function PendingOrders() {
  const { pendings, removePending } = usePendingOrders()

  if (pendings.length === 0) {
    return null
  }

  return (
    <Card className="border-2 border-warning">
      <Card.Header>
        <Card.Title>⏳ Pending Orders</Card.Title>
        <Card.Description>
          {pendings.length} 笔订单待处理
        </Card.Description>
      </Card.Header>
      <Card.Content>
        <div className="space-y-2">
          {pendings.map((item) => (
            <PendingOrderRow
              key={item.digest}
              item={item}
              onConfirm={() => removePending(item.digest)}
            />
          ))}
        </div>
        <div className="text-xs text-muted-foreground mt-4 pt-3 border-t border-border">
          <p>• 即时模式：订单立即结算</p>
          <p>• 完成后点击"标记完成"移除记录</p>
        </div>
      </Card.Content>
    </Card>
  )
}

function PendingOrderRow({
  item,
  onConfirm
}: {
  item: PendingOrderItem
  onConfirm: () => void
}) {
  const explorerUrl = getExplorerUrl(item.network, item.digest)

  const timeStr = new Date(item.time).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })

  const elapsed = Date.now() - item.time
  const minutesElapsed = Math.floor(elapsed / (1000 * 60))
  const isComplete = minutesElapsed >= 1

  return (
    <div className="border border-border rounded-lg p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium">卖出 {item.amount}</span>
            <span className="text-xs text-muted-foreground">{item.brandKey}</span>
            {isComplete && (
              <span className="text-xs text-success">已完成</span>
            )}
          </div>
          <div className="text-xs text-muted-foreground">
            提交时间: {timeStr}
          </div>
          <div className="text-xs text-muted-foreground">
            已等待: {minutesElapsed} 分钟
          </div>
          <code className="text-xs text-muted-foreground truncate block mt-1">
            {item.digest.slice(0, 20)}...
          </code>
        </div>

        <div className="flex flex-col gap-1 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onPress={() => window.open(explorerUrl, '_blank')}
          >
            查看
          </Button>
          {isComplete && (
            <Button
              variant="ghost"
              size="sm"
              onPress={onConfirm}
            >
              标记完成
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

function getExplorerUrl(network: string, digest: string): string {
  const baseUrl = network === 'mainnet'
    ? 'https://suiscan.xyz/mainnet'
    : 'https://suiscan.xyz/testnet'
  return `${baseUrl}/tx/${digest}`
}
