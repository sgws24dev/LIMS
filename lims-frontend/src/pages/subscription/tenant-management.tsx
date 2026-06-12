"use client"

import { useState, useMemo, useCallback } from "react"
import {
  Building2, Plus, Search, Eye, Edit, Trash2, Ban, CheckCircle,
  Globe, Users, HardDrive, CreditCard, Palette, Upload,
  ChevronDown, ChevronRight, Loader2, MoreHorizontal,
} from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StatCard } from "@/components/ui/stat-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
  DialogFooter, DialogClose, DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { SearchInput } from "@/components/ui/search-input"
import { Pagination } from "@/components/ui/pagination"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatCurrency, formatDate, cn } from "@/lib/utils"
import { tenants } from "@/mock/data/tenants"
import type { Tenant } from "@/types"
import { useToast } from "@/hooks/use-toast"

interface ExtendedTenant extends Tenant {
  storageTotal: number
  adminEmail: string
  brandName?: string
  primaryColor?: string
  customDomain?: string
}

const extendedTenants: ExtendedTenant[] = tenants.map((t, idx) => ({
  ...t,
  storageTotal: t.plan === "enterprise" ? 1000 : t.plan === "professional" ? 100 : t.plan === "basic" ? 10 : 1,
  adminEmail: `admin@${t.domain}`,
  brandName: t.name,
  primaryColor: ["#2563eb", "#7c3aed", "#16a34a", "#d97706", "#dc2626"][idx % 5],
  customDomain: idx < 2 ? `lab.${t.domain}` : undefined,
}))

const planColors: Record<string, "default" | "secondary" | "warning" | "success"> = {
  trial: "secondary",
  basic: "default",
  professional: "warning",
  enterprise: "success",
}

const statusColors: Record<string, "success" | "destructive" | "secondary"> = {
  active: "success",
  suspended: "destructive",
  cancelled: "secondary",
}

export default function TenantManagement() {
  const { toast } = useToast()
  const [data, setData] = useState<ExtendedTenant[]>(extendedTenants)
  const [search, setSearch] = useState("")
  const [planFilter, setPlanFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<ExtendedTenant | null>(null)
  const [showPlanDialog, setShowPlanDialog] = useState(false)
  const [planTarget, setPlanTarget] = useState<ExtendedTenant | null>(null)
  const [newPlan, setNewPlan] = useState<string>("")
  const [saving, setSaving] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const [newTenant, setNewTenant] = useState({
    name: "",
    domain: "",
    plan: "basic",
    adminEmail: "",
  })

  const filtered = useMemo(() => {
    return data.filter((t) => {
      const q = search.toLowerCase()
      const matchesSearch = !search ||
        t.name.toLowerCase().includes(q) ||
        t.domain.toLowerCase().includes(q) ||
        t.adminEmail.toLowerCase().includes(q)
      const matchesPlan = planFilter === "all" || t.plan === planFilter
      const matchesStatus = statusFilter === "all" || t.status === statusFilter
      return matchesSearch && matchesPlan && matchesStatus
    })
  }, [data, search, planFilter, statusFilter])

  const slicedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, currentPage, pageSize])

  const totalPages = Math.ceil(filtered.length / pageSize)

  const stats = useMemo(() => ({
    total: data.length,
    active: data.filter((t) => t.status === "active").length,
    trialEnding: data.filter((t) => t.plan === "trial").length,
    revenue: data.filter((t) => t.status === "active").reduce((sum, t) => {
      const prices: Record<string, number> = { trial: 0, basic: 4999, professional: 14999, enterprise: 49999 }
      return sum + (prices[t.plan] || 0)
    }, 0),
  }), [data])

  const handleCreate = useCallback(async () => {
    if (!newTenant.name || !newTenant.domain || !newTenant.adminEmail) {
      toast({ title: "Validation error", description: "All fields are required.", variant: "destructive" })
      return
    }
    setSaving(true)
    await new Promise((r) => setTimeout(r, 1000))
    const tenant: ExtendedTenant = {
      id: `TNT${String(data.length + 1).padStart(3, "0")}`,
      name: newTenant.name,
      domain: newTenant.domain,
      plan: newTenant.plan as any,
      status: "active",
      usersCount: 0,
      storageUsed: 0,
      storageTotal: 10,
      adminEmail: newTenant.adminEmail,
      subscriptionEnds: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
    }
    setData([...data, tenant])
    setNewTenant({ name: "", domain: "", plan: "basic", adminEmail: "" })
    setShowCreateDialog(false)
    setSaving(false)
    toast({ title: "Tenant created", variant: "success" })
  }, [newTenant, data, toast])

  const handleToggleStatus = useCallback((tenant: ExtendedTenant) => {
    setData(data.map((t) => t.id === tenant.id ? { ...t, status: t.status === "active" ? "suspended" : "active" } : t))
    toast({ title: tenant.status === "active" ? "Tenant suspended" : "Tenant activated", variant: "success" })
  }, [data, toast])

  const handleDelete = useCallback(() => {
    if (!deleteTarget) return
    setData(data.filter((t) => t.id !== deleteTarget.id))
    setShowDeleteDialog(false)
    setDeleteTarget(null)
    toast({ title: "Tenant deleted", variant: "success" })
  }, [deleteTarget, data, toast])

  const handleChangePlan = useCallback(async () => {
    if (!planTarget || !newPlan) return
    setSaving(true)
    await new Promise((r) => setTimeout(r, 1000))
    const storageMap: Record<string, number> = { trial: 1, basic: 10, professional: 100, enterprise: 1000 }
    setData(data.map((t) => t.id === planTarget.id ? { ...t, plan: newPlan as any, storageTotal: storageMap[newPlan] || 10 } : t))
    setShowPlanDialog(false)
    setSaving(false)
    toast({ title: "Plan changed", variant: "success" })
  }, [planTarget, newPlan, data, toast])

  const plans = ["trial", "basic", "professional", "enterprise"]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tenant Management"
        description="Super admin: manage all subscribed laboratory tenants"
        actions={
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Tenant
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Create New Tenant</DialogTitle>
                <DialogDescription>Provision a new laboratory tenant</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tenantName">Laboratory Name</Label>
                  <Input id="tenantName" placeholder="e.g. City Diagnostics" value={newTenant.name} onChange={(e) => setNewTenant({ ...newTenant, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tenantDomain">Domain</Label>
                  <Input id="tenantDomain" placeholder="e.g. citydiag.in" value={newTenant.domain} onChange={(e) => setNewTenant({ ...newTenant, domain: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tenantPlan">Plan</Label>
                  <Select value={newTenant.plan} onValueChange={(v) => setNewTenant({ ...newTenant, plan: v })}>
                    <SelectTrigger id="tenantPlan">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="trial">Trial</SelectItem>
                      <SelectItem value="basic">Basic - ₹4,999/mo</SelectItem>
                      <SelectItem value="professional">Professional - ₹14,999/mo</SelectItem>
                      <SelectItem value="enterprise">Enterprise - ₹49,999/mo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tenantAdmin">Admin Email</Label>
                  <Input id="tenantAdmin" type="email" placeholder="admin@citydiag.in" value={newTenant.adminEmail} onChange={(e) => setNewTenant({ ...newTenant, adminEmail: e.target.value })} />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={handleCreate} disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Tenant
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Tenants" value={stats.total} icon={<Building2 className="h-5 w-5" />} />
        <StatCard label="Active" value={stats.active} icon={<CheckCircle className="h-5 w-5" />} />
        <StatCard label="Trial Ending" value={stats.trialEnding} icon={<Users className="h-5 w-5" />} trend={{ value: 2, positive: false }} />
        <StatCard label="MRR" value={formatCurrency(stats.revenue)} icon={<CreditCard className="h-5 w-5" />} />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center gap-3">
            <SearchInput
              placeholder="Search by name, domain or email..."
              value={search}
              onSearch={(v) => { setSearch(v); setCurrentPage(1) }}
              className="w-64"
            />
            <Select value={planFilter} onValueChange={(v) => { setPlanFilter(v); setCurrentPage(1) }}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="All Plans" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plans</SelectItem>
                {plans.map((p) => (
                  <SelectItem key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1) }}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8"></TableHead>
                <TableHead>Tenant</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead className="text-center">Users</TableHead>
                <TableHead className="text-center">Storage</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {slicedData.map((tenant) => {
                const isExpanded = expandedRow === tenant.id
                return (
                  <>
                    <TableRow
                      key={tenant.id}
                      className="cursor-pointer"
                      onClick={() => setExpandedRow(isExpanded ? null : tenant.id)}
                    >
                      <TableCell>
                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{tenant.name}</p>
                          <p className="text-xs text-muted-foreground">{tenant.domain}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={planColors[tenant.plan] || "secondary"}>
                          {tenant.plan.charAt(0).toUpperCase() + tenant.plan.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">{tenant.usersCount}</TableCell>
                      <TableCell className="text-center">
                        <span className="text-sm">{tenant.storageUsed} / {tenant.storageTotal} GB</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusColors[tenant.status] || "secondary"}>
                          {tenant.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(tenant.createdAt, "short")}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setPlanTarget(tenant); setNewPlan(tenant.plan); setShowPlanDialog(true) }}>
                              <CreditCard className="mr-2 h-4 w-4" />
                              Change Plan
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleStatus(tenant)}>
                              {tenant.status === "active" ? (
                                <><Ban className="mr-2 h-4 w-4" /> Suspend</>
                              ) : (
                                <><CheckCircle className="mr-2 h-4 w-4" /> Activate</>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => { setDeleteTarget(tenant); setShowDeleteDialog(true) }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                    {isExpanded && (
                      <TableRow key={`${tenant.id}-detail`}>
                        <TableCell colSpan={8} className="bg-muted/30 p-0">
                          <div className="p-4 pl-12">
                            <Tabs defaultValue="subscription">
                              <TabsList>
                                <TabsTrigger value="subscription">Subscription</TabsTrigger>
                                <TabsTrigger value="whitelabel">White-Label</TabsTrigger>
                              </TabsList>

                              <TabsContent value="subscription" className="space-y-4 pt-4">
                                <div className="grid gap-4 sm:grid-cols-3">
                                  <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">Admin Email</p>
                                    <p className="text-sm font-medium">{tenant.adminEmail}</p>
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">Subscription Ends</p>
                                    <p className="text-sm font-medium">{formatDate(tenant.subscriptionEnds, "short")}</p>
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">Users</p>
                                    <div className="flex items-center gap-2">
                                      <Progress value={tenant.usersCount} max={tenant.plan === "enterprise" ? 500 : tenant.plan === "professional" ? 50 : tenant.plan === "basic" ? 10 : 3} className="flex-1" />
                                      <span className="text-xs text-muted-foreground">{tenant.usersCount}</span>
                                    </div>
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">Storage Used</p>
                                    <div className="flex items-center gap-2">
                                      <Progress value={tenant.storageUsed} max={tenant.storageTotal} variant={tenant.storageUsed / tenant.storageTotal > 0.8 ? "warning" : "default"} className="flex-1" />
                                      <span className="text-xs text-muted-foreground">{tenant.storageUsed} GB</span>
                                    </div>
                                  </div>
                                </div>
                              </TabsContent>

                              <TabsContent value="whitelabel" className="space-y-4 pt-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                  <div className="space-y-2">
                                    <Label>Brand Name</Label>
                                    <Input value={tenant.brandName || ""} readOnly className="bg-muted/50" />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Custom Domain</Label>
                                    <Input value={tenant.customDomain || "Not configured"} readOnly className="bg-muted/50" />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Primary Color</Label>
                                    <div className="flex items-center gap-2">
                                      <div
                                        className="h-8 w-8 rounded-full border"
                                        style={{ backgroundColor: tenant.primaryColor || "#2563eb" }}
                                      />
                                      <Input value={tenant.primaryColor || "#2563eb"} readOnly className="w-24 bg-muted/50 font-mono" />
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Logo</Label>
                                    <div className="flex items-center gap-2">
                                      <div className="flex h-10 w-10 items-center justify-center rounded-lg border bg-muted/50">
                                        <Building2 className="h-5 w-5 text-muted-foreground" />
                                      </div>
                                      <Button variant="outline" size="sm" disabled>
                                        <Upload className="mr-2 h-4 w-4" />
                                        Upload Logo
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                                <div className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
                                  White-label settings can be updated by the tenant admin from their settings panel.
                                </div>
                              </TabsContent>
                            </Tabs>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                )
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                    No tenants found matching your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <div className="px-2 pb-2">
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        </CardContent>
      </Card>

      {/* Change Plan Dialog */}
      <Dialog open={showPlanDialog} onOpenChange={setShowPlanDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Plan</DialogTitle>
            <DialogDescription>Update subscription plan for {planTarget?.name}</DialogDescription>
          </DialogHeader>
          {planTarget && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Current Plan</Label>
                <p className="text-sm font-medium capitalize">{planTarget.plan}</p>
              </div>
              <div className="space-y-2">
                <Label>New Plan</Label>
                <Select value={newPlan} onValueChange={setNewPlan}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {plans.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleChangePlan} disabled={saving || newPlan === planTarget?.plan}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Change Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Tenant</DialogTitle>
            <DialogDescription>
              This action cannot be undone. All data for {deleteTarget?.name} will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4 text-sm">
            <p className="font-medium text-destructive">Warning</p>
            <p className="mt-1 text-muted-foreground">
              This will permanently delete all patient records, test data, and configuration for this tenant.
            </p>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDelete}>Delete Tenant</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
