"use client"

import { useState, useMemo, useCallback } from "react"
import {
  Check, X, Crown, Users, HardDrive, Calendar, CreditCard,
  ArrowRight, AlertTriangle, Loader2,
  Download,
} from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
  DialogFooter, DialogClose,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { DataTable } from "@/components/ui/data-table"
import type { ColumnDef } from "@/components/ui/data-table"
import { cn, formatCurrency, formatDate } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

interface Plan {
  id: string
  name: string
  price: number
  period: "monthly" | "yearly"
  description: string
  features: { text: string; included: boolean }[]
  maxUsers: number
  maxStorage: number
  highlighted?: boolean
}

interface BillingRecord {
  id: string
  invoice: string
  date: string
  plan: string
  amount: number
  status: "paid" | "pending" | "failed" | "refunded"
}

const plans: Plan[] = [
  {
    id: "trial",
    name: "Trial",
    price: 0,
    period: "monthly",
    description: "Perfect for evaluating the platform",
    maxUsers: 3,
    maxStorage: 1,
    features: [
      { text: "Up to 3 users", included: true },
      { text: "1 GB storage", included: true },
      { text: "Basic test catalog", included: true },
      { text: "Email support", included: true },
      { text: "Basic reports", included: true },
      { text: "API access", included: false },
      { text: "Custom branding", included: false },
      { text: "Priority support", included: false },
      { text: "Advanced analytics", included: false },
      { text: "White-label", included: false },
    ],
  },
  {
    id: "basic",
    name: "Basic",
    price: 4999,
    period: "monthly",
    description: "For small laboratories starting out",
    maxUsers: 10,
    maxStorage: 10,
    features: [
      { text: "Up to 10 users", included: true },
      { text: "10 GB storage", included: true },
      { text: "Full test catalog", included: true },
      { text: "Email support", included: true },
      { text: "Advanced reports", included: true },
      { text: "API access", included: true },
      { text: "Custom branding", included: false },
      { text: "Priority support", included: false },
      { text: "Advanced analytics", included: false },
      { text: "White-label", included: false },
    ],
  },
  {
    id: "professional",
    name: "Professional",
    price: 14999,
    period: "monthly",
    description: "For growing labs with advanced needs",
    maxUsers: 50,
    maxStorage: 100,
    highlighted: true,
    features: [
      { text: "Up to 50 users", included: true },
      { text: "100 GB storage", included: true },
      { text: "Full test catalog", included: true },
      { text: "Priority email & phone support", included: true },
      { text: "Advanced reports & analytics", included: true },
      { text: "Full API access", included: true },
      { text: "Custom branding", included: true },
      { text: "Priority support", included: true },
      { text: "Advanced analytics", included: true },
      { text: "White-label", included: false },
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 49999,
    period: "monthly",
    description: "For large multi-branch diagnostic chains",
    maxUsers: 500,
    maxStorage: 1000,
    features: [
      { text: "Up to 500 users", included: true },
      { text: "1 TB storage", included: true },
      { text: "Everything in Professional", included: true },
      { text: "24/7 dedicated support", included: true },
      { text: "Custom integrations", included: true },
      { text: "Full API access", included: true },
      { text: "Custom branding", included: true },
      { text: "Dedicated account manager", included: true },
      { text: "Advanced analytics & BI", included: true },
      { text: "White-label & multi-tenant", included: true },
    ],
  },
]

const billingHistory: BillingRecord[] = [
  { id: "B001", invoice: "INV-2026-001", date: "2026-06-01T00:00:00Z", plan: "Professional", amount: 14999, status: "paid" },
  { id: "B002", invoice: "INV-2026-002", date: "2026-05-01T00:00:00Z", plan: "Professional", amount: 14999, status: "paid" },
  { id: "B003", invoice: "INV-2026-003", date: "2026-04-01T00:00:00Z", plan: "Professional", amount: 14999, status: "paid" },
  { id: "B004", invoice: "INV-2026-004", date: "2026-03-01T00:00:00Z", plan: "Professional", amount: 14999, status: "paid" },
  { id: "B005", invoice: "INV-2026-005", date: "2026-02-01T00:00:00Z", plan: "Basic", amount: 4999, status: "paid" },
  { id: "B006", invoice: "INV-2026-006", date: "2026-01-01T00:00:00Z", plan: "Basic", amount: 4999, status: "paid" },
  { id: "B007", invoice: "INV-2025-012", date: "2025-12-01T00:00:00Z", plan: "Basic", amount: 4999, status: "paid" },
  { id: "B008", invoice: "INV-2025-011", date: "2025-11-01T00:00:00Z", plan: "Trial", amount: 0, status: "paid" },
]

const statusColors: Record<string, "success" | "warning" | "destructive" | "secondary"> = {
  paid: "success",
  pending: "warning",
  failed: "destructive",
  refunded: "secondary",
}

export default function SubscriptionPlans() {
  const { toast } = useToast()
  const [currentPlan, setCurrentPlan] = useState("professional")
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly")
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [cancellationStep, setCancellationStep] = useState<"confirm" | "reason" | "done">("confirm")
  const [cancelReason, setCancelReason] = useState("")
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const currentPlanData = useMemo(() => plans.find((p) => p.id === currentPlan)!, [currentPlan])

  const handleUpgrade = useCallback((plan: Plan) => {
    setSelectedPlan(plan)
    setShowUpgradeDialog(true)
  }, [])

  const confirmUpgrade = useCallback(async () => {
    setIsProcessing(true)
    await new Promise((r) => setTimeout(r, 1500))
    setCurrentPlan(selectedPlan!.id)
    setShowUpgradeDialog(false)
    setIsProcessing(false)
    toast({ title: "Plan updated", description: `Successfully upgraded to ${selectedPlan!.name} plan.`, variant: "success" })
  }, [selectedPlan, toast])

  const handleCancelStart = useCallback(() => {
    setCancellationStep("confirm")
    setShowCancelDialog(true)
  }, [])

  const handleCancelNext = useCallback(() => {
    setCancellationStep("reason")
  }, [])

  const confirmCancellation = useCallback(async () => {
    setIsProcessing(true)
    await new Promise((r) => setTimeout(r, 1500))
    setIsProcessing(false)
    setCancellationStep("done")
  }, [])

  const closeCancellation = useCallback(() => {
    setShowCancelDialog(false)
    setCancellationStep("confirm")
    setCancelReason("")
    toast({ title: "Cancellation submitted", description: "Your subscription will end on the next billing date.", variant: "warning" })
  }, [toast])

  const billingColumns: ColumnDef<BillingRecord>[] = [
    {
      id: "invoice",
      header: "Invoice",
      cell: (bill) => <span className="font-mono text-xs">{bill.invoice}</span>,
    },
    {
      id: "date",
      header: "Date",
      cell: (bill) => <span>{formatDate(bill.date, "short")}</span>,
    },
    {
      id: "plan",
      header: "Plan",
      accessorKey: "plan",
    },
    {
      id: "amount",
      header: "Amount",
      className: "text-right font-medium",
      cell: (bill) => (bill.amount === 0 ? "Free" : formatCurrency(bill.amount)),
    },
    {
      id: "status",
      header: "Status",
      cell: (bill) => <Badge variant={statusColors[bill.status]}>{bill.status}</Badge>,
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subscription & Billing"
        description="Manage your plan, usage, and billing information"
      />

      {/* Current Subscription */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Current Subscription</CardTitle>
              <CardDescription>Your active plan and usage details</CardDescription>
            </div>
            <Badge className="text-sm px-3 py-1">{currentPlanData.name}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Status</p>
              <p className="flex items-center gap-2 text-sm font-medium">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Active
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Users</p>
              <p className="flex items-center gap-2 text-sm font-medium">
                <Users className="h-4 w-4 text-muted-foreground" />
                24 / {currentPlanData.maxUsers}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Storage</p>
              <p className="flex items-center gap-2 text-sm font-medium">
                <HardDrive className="h-4 w-4 text-muted-foreground" />
                42 GB / {currentPlanData.maxStorage} GB
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Next Billing</p>
              <p className="flex items-center gap-2 text-sm font-medium">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                {formatDate("2026-07-01", "short")}
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Users Used</span>
                <span className="font-medium">24 / {currentPlanData.maxUsers}</span>
              </div>
              <Progress value={24} max={currentPlanData.maxUsers} variant={24 / currentPlanData.maxUsers > 0.8 ? "warning" : "default"} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Storage Used</span>
                <span className="font-medium">42 GB / {currentPlanData.maxStorage} GB</span>
              </div>
              <Progress value={42} max={currentPlanData.maxStorage} variant={42 / currentPlanData.maxStorage > 0.8 ? "warning" : "default"} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Grid */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Available Plans</h2>
          <div className="flex items-center gap-2">
            <Label htmlFor="billing-period" className="text-sm">Monthly</Label>
            <Switch
              id="billing-period"
              checked={billingPeriod === "yearly"}
              onCheckedChange={(v) => setBillingPeriod(v ? "yearly" : "monthly")}
            />
            <Label htmlFor="billing-period" className="text-sm">Yearly <Badge variant="success" className="ml-1 text-[10px]">Save 20%</Badge></Label>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => {
            const isCurrent = currentPlan === plan.id
            const yearlyPrice = plan.price * 10
            const displayPrice = billingPeriod === "yearly" && plan.price > 0 ? yearlyPrice : plan.price

            return (
              <Card
                key={plan.id}
                className={cn(
                  "relative flex flex-col",
                  plan.highlighted && "ring-2 ring-primary",
                  isCurrent && "border-emerald-500"
                )}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="px-3">Most Popular</Badge>
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    {isCurrent && <Badge variant="success">Current</Badge>}
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col">
                  <div className="mb-6">
                    <span className="text-3xl font-bold">
                      {plan.price === 0 ? "Free" : formatCurrency(displayPrice)}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-sm text-muted-foreground">/{billingPeriod === "monthly" ? "month" : "year"}</span>
                    )}
                    {billingPeriod === "yearly" && plan.price > 0 && (
                      <p className="mt-1 text-xs text-emerald-600">
                        {formatCurrency(plan.price)}/month billed annually
                      </p>
                    )}
                  </div>

                  <div className="mb-6 flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {plan.maxUsers} users</span>
                    <span className="flex items-center gap-1"><HardDrive className="h-4 w-4" /> {plan.maxStorage} GB</span>
                  </div>

                  <ul className="mb-6 space-y-2.5 flex-1">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        {feat.included ? (
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                        ) : (
                          <X className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                        )}
                        <span className={cn(!feat.included && "text-muted-foreground")}>{feat.text}</span>
                      </li>
                    ))}
                  </ul>

                  {isCurrent ? (
                    <Button variant="outline" className="w-full" onClick={handleCancelStart}>
                      Cancel Subscription
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      variant={plan.highlighted ? "default" : "outline"}
                      onClick={() => handleUpgrade(plan)}
                      disabled={plan.price === 0}
                    >
                      {plan.price === 0 ? "Current" : plan.price > currentPlanData.price ? "Upgrade" : "Downgrade"}
                      {plan.price > 0 && <ArrowRight className="ml-2 h-4 w-4" />}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Billing History</CardTitle>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Download All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable columns={billingColumns} data={billingHistory} pageSize={10} exportable />
        </CardContent>
      </Card>

      {/* Upgrade/Downgrade Dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Plan Change</DialogTitle>
            <DialogDescription>
              {selectedPlan && selectedPlan.price > currentPlanData.price
                ? "You are upgrading your subscription plan."
                : "You are downgrading your subscription plan."}
            </DialogDescription>
          </DialogHeader>
          {selectedPlan && (
            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Current Plan</p>
                    <p className="font-medium">{currentPlanData.name} - {formatCurrency(currentPlanData.price)}/mo</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">New Plan</p>
                    <p className="font-medium">{selectedPlan.name} - {formatCurrency(selectedPlan.price)}/mo</p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
                <AlertTriangle className="mr-2 inline h-4 w-4 text-amber-500" />
                Changes will take effect from the next billing cycle. No prorated refunds for downgrades.
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={confirmUpgrade} disabled={isProcessing}>
              {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm {selectedPlan && selectedPlan.price > currentPlanData.price ? "Upgrade" : "Downgrade"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancellation Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={(open) => { if (!open) { setShowCancelDialog(false); setCancellationStep("confirm") } }}>
        <DialogContent>
          {cancellationStep === "confirm" && (
            <>
              <DialogHeader>
                <DialogTitle>Cancel Subscription</DialogTitle>
                <DialogDescription>Are you sure you want to cancel your subscription?</DialogDescription>
              </DialogHeader>
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
                <AlertTriangle className="mr-2 inline h-4 w-4" />
                Your subscription will remain active until the end of the current billing period.
                After cancellation, your data will be archived for 30 days.
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Keep Subscription</Button>
                </DialogClose>
                <Button variant="destructive" onClick={handleCancelNext}>Yes, Cancel</Button>
              </DialogFooter>
            </>
          )}
          {cancellationStep === "reason" && (
            <>
              <DialogHeader>
                <DialogTitle>Tell us why</DialogTitle>
                <DialogDescription>We value your feedback. Why are you cancelling?</DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                {["Too expensive", "Missing features", "Switching to competitor", "No longer needed", "Technical issues", "Other"].map((reason) => (
                  <label key={reason} className="flex items-center gap-2 rounded-lg border p-3 text-sm cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                    <input type="radio" name="cancelReason" value={reason} checked={cancelReason === reason} onChange={(e) => setCancelReason(e.target.value)} className="accent-primary" />
                    {reason}
                  </label>
                ))}
                {cancelReason === "Other" && (
                  <Textarea placeholder="Please elaborate..." rows={3} />
                )}
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Go Back</Button>
                </DialogClose>
                <Button variant="destructive" onClick={confirmCancellation} disabled={!cancelReason || isProcessing}>
                  {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Confirm Cancellation
                </Button>
              </DialogFooter>
            </>
          )}
          {cancellationStep === "done" && (
            <>
              <DialogHeader>
                <DialogTitle>Cancellation Submitted</DialogTitle>
                <DialogDescription>Your subscription has been scheduled for cancellation.</DialogDescription>
              </DialogHeader>
              <div className="rounded-lg bg-muted/50 p-4 text-sm">
                <p>Your {currentPlanData.name} plan will remain active until <strong>{formatDate("2026-07-01", "short")}</strong>.</p>
                <p className="mt-2 text-muted-foreground">You can resubscribe anytime before then to keep your data.</p>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button onClick={closeCancellation}>Done</Button>
                </DialogClose>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
