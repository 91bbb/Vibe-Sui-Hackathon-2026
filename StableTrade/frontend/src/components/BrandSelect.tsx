import { BRANDS, getBrandByKey } from '../config/brands'
import { useAppStore } from '../lib/store'

export function BrandSelect() {
  const selectedBrand = useAppStore((state) => state.selectedBrand)
  const setBrand = useAppStore((state) => state.setBrand)

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newBrand = getBrandByKey(e.target.value)
    if (newBrand) {
      setBrand(newBrand)
      console.log('🏷️ Brand switched to:', newBrand.displayName)
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor="brand-select"
        className="text-xs font-medium uppercase tracking-wide"
        style={{ color: 'var(--text-dim)' }}
      >
        Virtual Asset
      </label>
      <select
        id="brand-select"
        value={selectedBrand.key}
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
        {BRANDS.map((b) => (
          <option key={b.key} value={b.key}>
            {b.displayName}
            {b.tags && b.tags.length > 0 ? ` (${b.tags.join(', ')})` : ''}
          </option>
        ))}
      </select>
      {selectedBrand.notes && (
        <p className="text-xs mt-1" style={{ color: 'var(--text-dim)' }}>
          {selectedBrand.notes}
        </p>
      )}
    </div>
  )
}
