import { NETWORKS, type NetworkType } from '../config/networks'
import { useAppStore } from '../lib/store'

export function NetworkSelect() {
  const selectedNetwork = useAppStore((state) => state.selectedNetwork)
  const setNetwork = useAppStore((state) => state.setNetwork)

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newNetwork = e.target.value as NetworkType
    setNetwork(newNetwork)
    console.log('🔄 Network switched to:', newNetwork)
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor="network-select"
        className="text-xs font-medium uppercase tracking-wide"
        style={{ color: 'var(--text-dim)' }}
      >
        Network
      </label>
      <select
        id="network-select"
        value={selectedNetwork}
        onChange={handleChange}
        className="h-11 px-4 rounded-xl font-medium text-sm cursor-pointer transition-all duration-200"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          color: 'var(--text)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--border-hover)'
          e.currentTarget.style.background = 'var(--surface-hover)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--border)'
          e.currentTarget.style.background = 'var(--surface)'
        }}
      >
        {Object.values(NETWORKS).map((net) => (
          <option key={net.key} value={net.key}>
            {net.displayName}
          </option>
        ))}
      </select>
    </div>
  )
}
