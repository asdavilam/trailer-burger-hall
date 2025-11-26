// apps/admin/src/app/supplies/StockBadge.tsx
import { Supply } from '@trailer/shared'

export function StockBadge({ supply }: { supply: Supply }) {
  const { current_stock, min_stock, unit } = supply
  
  // Si no hay mínimo definido, asumimos 5 como alerta genérica
  const min = min_stock || 5 
  
  let colorClass = 'bg-green-100 text-green-800'
  let label = 'OK'

  if (current_stock <= 0) {
    colorClass = 'bg-red-100 text-red-800 font-bold'
    label = 'AGOTADO'
  } else if (current_stock <= min) {
    colorClass = 'bg-yellow-100 text-yellow-800 font-bold'
    label = 'BAJO'
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs ${colorClass}`}>
      {current_stock} {unit} - {label}
    </span>
  )
}