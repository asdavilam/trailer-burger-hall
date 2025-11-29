// apps/admin/src/app/supplies/StockBadge.tsx
import { Supply } from '@trailer/shared'
import { Badge } from '@/components/ui/Badge'

export function StockBadge({ supply }: { supply: Supply }) {
  const { current_stock, min_stock, unit } = supply

  // Si no hay mínimo definido, asumimos 5 como alerta genérica
  const min = min_stock || 5

  let variant: 'success' | 'warning' | 'error' = 'success'
  let label = 'OK'

  if (current_stock <= 0) {
    variant = 'error'
    label = 'AGOTADO'
  } else if (current_stock <= min) {
    variant = 'warning'
    label = 'BAJO'
  }

  return (
    <Badge variant={variant}>
      {current_stock} {unit} - {label}
    </Badge>
  )
}