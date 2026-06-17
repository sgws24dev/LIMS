import { AlertTriangle } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { useNavigate } from 'react-router-dom'

interface LowStockAlertBannerProps {
  count: number
}

export function LowStockAlertBanner({ count }: LowStockAlertBannerProps) {
  const navigate = useNavigate()
  if (count <= 0) return null

  return (
    <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        <span className="text-amber-800 dark:text-amber-200 font-medium">
          {count} {count === 1 ? 'item is' : 'items are'} running low on stock.
        </span>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/inventory/items?status=LowStock')}
        >
          View Low-Stock Items
        </Button>
        <Button
          size="sm"
          onClick={() => navigate('/inventory/purchase-orders')}
        >
          Create Purchase Order
        </Button>
      </div>
    </div>
  )
}
