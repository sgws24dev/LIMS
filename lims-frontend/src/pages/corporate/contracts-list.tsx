"use client"

import { useState, useMemo, useEffect } from "react"
import { Plus, FileText, IndianRupee, AlertTriangle, Eye, RefreshCw, XCircle } from "lucide-react"
import type { CorporateContract } from "@/mock/data/corporate"
import { corporateContracts, corporateAccounts } from "@/mock/data/corporate"
import { cn, formatDate, formatCurrency, generateId } from "@/lib/utils"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DataTable,
  type ColumnDef,
} from "@/components/ui/data-table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { StatCard } from "@/components/ui/stat-card"
import { EmptyState } from "@/components/ui/empty-state"
import { SearchInput } from "@/components/ui/search-input"
import { useToast } from "@/hooks/use-toast"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts"
import { useAppStore } from "@/store/appStore"

const statusStyles: Record<string, "success" | "secondary" | "destructive"> = {
  active: "success",
  expired: "secondary",
  terminated: "destructive",
}

export default function ContractsList() {
  const { toast } = useToast()
  const { setBreadcrumbs } = useAppStore()
  useEffect(() => { setBreadcrumbs([{ label: "Corporate & B2B", href: "/corporate" }, { label: "Contracts" }]) }, [])
  const [contracts, setContracts] = useState(corporateContracts)
  const [corpAccounts] = useState(corporateAccounts)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedContract, setSelectedContract] =
    useState<CorporateContract | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const filteredContracts = useMemo(() => {
    return contracts.filter((c) => {
      const corp = corpAccounts.find((a) => a.id === c.corporateId)
      const matchesSearch =
        !search ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (corp?.name || "").toLowerCase().includes(search.toLowerCase()) ||
        c.id.toLowerCase().includes(search.toLowerCase())
      const matchesStatus =
        statusFilter === "all" || c.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [search, statusFilter])

  const stats = useMemo(() => {
    const active = contracts.filter((c) => c.status === "active").length
    const now = new Date()
    const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    const expiringSoon = contracts.filter((c) => {
      if (c.status !== "active") return false
      const end = new Date(c.endDate)
      return end > now && end <= thirtyDays
    }).length
    const totalValue = contracts.reduce(
      (sum, c) => sum + c.negotiatedPrice,
      0
    )
    return { total: contracts.length, active, expiringSoon, totalValue }
  }, [])

  const getCorporateName = (corpId: string) =>
    corpAccounts.find((a) => a.id === corpId)?.name || "Unknown"

  const contractValueData = useMemo(() => {
    return contracts.map((c) => ({
      name: getCorporateName(c.corporateId).split(" ")[0],
      value: c.negotiatedPrice,
    }))
  }, [])

  const handleRenew = (contract: CorporateContract) => {
    const now = new Date()
    const extendedEnd = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate())
      .toISOString()
      .split("T")[0]
    setContracts(
      contracts.map((c) =>
        c.id === contract.id
          ? { ...c, status: "active" as const, startDate: now.toISOString().split("T")[0], endDate: extendedEnd }
          : c
      )
    )
    toast({
      title: "Contract Renewed",
      description: `${contract.name} has been renewed until ${extendedEnd}.`,
      variant: "success",
    })
  }

  const handleTerminate = (contract: CorporateContract) => {
    setContracts(
      contracts.map((c) =>
        c.id === contract.id ? { ...c, status: "terminated" as const } : c
      )
    )
    toast({
      title: "Contract Terminated",
      description: `${contract.name} has been terminated.`,
      variant: "destructive",
    })
  }

  const handleView = (contract: CorporateContract) => {
    setSelectedContract(contract)
    setDetailOpen(true)
  }

  const contractColumns: ColumnDef<CorporateContract>[] = [
    {
      id: "id",
      header: "Contract ID",
      cell: (row) => <span className="font-mono text-xs font-medium">{row.id}</span>,
    },
    {
      id: "corporateName",
      header: "Corporate Name",
      cell: (row) => <span className="font-medium">{getCorporateName(row.corporateId)}</span>,
    },
    {
      id: "startDate",
      header: "Start Date",
      cell: (row) => formatDate(row.startDate),
    },
    {
      id: "endDate",
      header: "End Date",
      cell: (row) => formatDate(row.endDate),
    },
    {
      id: "type",
      header: "Type",
      cell: (row) => (
        <Badge variant="outline">
          {row.testIds.length > 5 ? "Comprehensive" : "Standard"}
        </Badge>
      ),
    },
    {
      id: "value",
      header: "Value",
      className: "text-right",
      cell: (row) => <span className="font-medium">{formatCurrency(row.negotiatedPrice)}</span>,
    },
    {
      id: "status",
      header: "Status",
      cell: (row) => <Badge variant={statusStyles[row.status]}>{row.status}</Badge>,
    },
    {
      id: "actions",
      header: "Actions",
      className: "w-[180px]",
      cell: (row) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => handleView(row)}>
            <Eye className="mr-1 h-3 w-3" />
            View
          </Button>
          {row.status === "active" && (
            <>
              <Button variant="ghost" size="sm" onClick={() => handleRenew(row)}>
                <RefreshCw className="mr-1 h-3 w-3" />
                Renew
              </Button>
              <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleTerminate(row)}>
                <XCircle className="mr-1 h-3 w-3" />
                Terminate
              </Button>
            </>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Corporate Contracts"
        description="Manage contracts with corporate clients"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<FileText className="h-5 w-5" />}
          label="Active Contracts"
          value={stats.active}
        />
        <StatCard
          icon={<AlertTriangle className="h-5 w-5" />}
          label="Expiring Soon (30 days)"
          value={stats.expiringSoon}
          trend={{ value: 12, positive: false }}
        />
        <StatCard
          icon={<IndianRupee className="h-5 w-5" />}
          label="Total Contract Value"
          value={formatCurrency(stats.totalValue)}
        />
        <StatCard
          icon={<FileText className="h-5 w-5" />}
          label="Total Contracts"
          value={stats.total}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contract Value Distribution</CardTitle>
          <CardDescription>Negotiated price per contract</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={contractValueData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" />
                <RechartsTooltip
                  formatter={(value: unknown) => formatCurrency(Number(value))}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <SearchInput
              placeholder="Search by contract ID, name, or company..."
              value={search}
              onSearch={setSearch}
              className="w-72"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="terminated">Terminated</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredContracts.length === 0 ? (
            <EmptyState
              icon={<FileText className="h-6 w-6" />}
              title="No contracts found"
              description="Try adjusting your search or filter criteria."
            />
          ) : (
            <DataTable
              columns={contractColumns}
              data={filteredContracts}
              pageSize={10}
              exportable
            />
          )}
        </CardContent>
      </Card>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Contract Details</DialogTitle>
            <DialogDescription>
              {selectedContract?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedContract && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Contract ID</Label>
                  <p className="font-mono text-sm font-medium">
                    {selectedContract.id}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Corporate</Label>
                  <p className="text-sm font-medium">
                    {getCorporateName(selectedContract.corporateId)}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Start Date</Label>
                  <p className="text-sm">
                    {formatDate(selectedContract.startDate, "long")}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">End Date</Label>
                  <p className="text-sm">
                    {formatDate(selectedContract.endDate, "long")}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">
                    Negotiated Price
                  </Label>
                  <p className="text-lg font-bold">
                    {formatCurrency(selectedContract.negotiatedPrice)}
                    <span className="text-sm font-normal text-muted-foreground">
                      /patient
                    </span>
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Discount</Label>
                  <p className="text-sm font-medium">
                    {selectedContract.discount}%
                  </p>
                </div>
              </div>
              <Separator />
              <div>
                <Label className="text-muted-foreground">
                  Included Tests & Packages
                </Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedContract.testIds.map((tid) => (
                    <Badge key={tid} variant="secondary">
                      {tid}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <Label className="text-muted-foreground">Status:</Label>
                <Badge variant={statusStyles[selectedContract.status]}>
                  {selectedContract.status}
                </Badge>
              </div>
              <Separator />
              <div>
                <Label className="text-muted-foreground">Terms Summary</Label>
                <p className="mt-1 text-sm text-muted-foreground">
                  This agreement covers {selectedContract.testIds.length} test
                  packages at a negotiated rate of{" "}
                  {formatCurrency(selectedContract.negotiatedPrice)} per patient
                  with a {selectedContract.discount}% discount on standard
                  pricing. The contract is valid from{" "}
                  {formatDate(selectedContract.startDate)} to{" "}
                  {formatDate(selectedContract.endDate)}.
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
