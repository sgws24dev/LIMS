import { Card, CardContent } from '@/shared/ui/card'
import { type CostBreakdownDto } from '@/services/api/scheduling'
import { IndianRupee, Percent } from 'lucide-react'

export function CostBreakdownCard({ cost, compact }: { cost: CostBreakdownDto; compact?: boolean }) {
  return (
    <Card>
      <CardContent className="p-4 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Hourly Rate</span>
          <span className="font-medium">{cost.currencySymbol}{Number(cost.hourlyRate).toLocaleString()}/hr</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Duration</span>
          <span className="font-medium">{cost.durationLabel}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Base Amount</span>
          <span className="font-medium">{cost.currencySymbol}{Number(cost.baseAmount).toLocaleString()}</span>
        </div>
        {cost.discount > 0 && (
          <div className="flex items-center justify-between text-sm text-green-600">
            <span className="flex items-center gap-1"><Percent className="h-3 w-3" /> {cost.discountReason || 'Discount'}</span>
            <span>-{cost.currencySymbol}{Number(cost.discount).toLocaleString()}</span>
          </div>
        )}
        <div className="border-t pt-2 flex items-center justify-between text-sm font-semibold">
          <span className="flex items-center gap-1"><IndianRupee className="h-3 w-3" /> Total</span>
          <span>{cost.currencySymbol}{Number(cost.totalAmount).toLocaleString()}</span>
        </div>
      </CardContent>
    </Card>
  )
}