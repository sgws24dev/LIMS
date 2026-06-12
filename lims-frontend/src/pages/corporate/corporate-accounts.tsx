"use client"

import { useState, useMemo, useEffect } from "react"
import { Plus, Building2, Users, FileText, IndianRupee, Search, ChevronDown, ChevronUp, Eye, Phone, Mail, MapPin, Calendar } from "lucide-react"
import type { CorporateAccount } from "@/mock/data/corporate"
import { corporateAccounts, corporateContracts } from "@/mock/data/corporate"
import { cn, formatDate, formatCurrency } from "@/lib/utils"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { SearchInput } from "@/components/ui/search-input"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import { Pagination } from "@/components/ui/pagination"
import { useToast } from "@/hooks/use-toast"
import { generateId } from "@/lib/utils"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { useNavigate } from "react-router-dom"
import { useAppStore } from "@/store/appStore"

const statusStyles: Record<string, "success" | "warning" | "secondary"> = {
  active: "success",
  suspended: "warning",
  expired: "secondary",
}

const contractTypeStyles: Record<string, "default" | "secondary" | "destructive" | "success" | "warning"> = {
  active: "success",
  expired: "secondary",
  terminated: "destructive",
}

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]

export default function CorporateAccounts() {
  const { toast } = useToast()
  const navigate = useNavigate()
  const { setBreadcrumbs } = useAppStore()
  useEffect(() => { setBreadcrumbs([{ label: "Corporate & B2B" }]) }, [])
  const [accounts, setAccounts] = useState(corporateAccounts)
  const [contracts, setContracts] = useState(corporateContracts)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [contractFilter, setContractFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    employeeCount: "",
    discount: "",
  })

  const filteredAccounts = useMemo(() => {
    return accounts.filter((acc) => {
      const matchesSearch =
        !search ||
        acc.name.toLowerCase().includes(search.toLowerCase()) ||
        acc.contactPerson.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = statusFilter === "all" || acc.status === statusFilter
      const contractStatus = contracts.find(
        (c) => c.corporateId === acc.id
      )?.status
      const matchesContract =
        contractFilter === "all" || contractStatus === contractFilter
      return matchesSearch && matchesStatus && matchesContract
    })
  }, [search, statusFilter, contractFilter])

  const slicedAccounts = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredAccounts.slice(start, start + pageSize)
  }, [filteredAccounts, currentPage, pageSize])

  const totalPages = Math.ceil(filteredAccounts.length / pageSize)

  const stats = useMemo(() => {
    const active = accounts.filter((a) => a.status === "active").length
    const totalEmployees = accounts.reduce(
      (sum, a) => sum + a.employeeCount,
      0
    )
    const totalRevenue = accounts.reduce(
      (sum, a) => sum + a.totalRevenue,
      0
    )
    return { total: accounts.length, active, totalEmployees, totalRevenue }
  }, [])

  const revenueChartData = useMemo(() => {
    return accounts.map((acc) => ({
      name: acc.name.split(" ")[0],
      revenue: acc.totalRevenue,
      employees: acc.employeeCount,
    }))
  }, [accounts])

  const employeeCoverageData = useMemo(() => {
    const total = accounts.reduce((s, a) => s + a.employeeCount, 0)
    return accounts.map((acc) => ({
      name: acc.name.split(" ")[0],
      value: acc.employeeCount,
      percentage: ((acc.employeeCount / total) * 100).toFixed(1),
    }))
  }, [accounts])

  const getContractsForAccount = (corpId: string) =>
    contracts.filter((c) => c.corporateId === corpId)

  const handleCreate = () => {
    const newAccount: CorporateAccount = {
      id: `CORP${String(accounts.length + 1).padStart(3, "0")}`,
      name: formData.name,
      contactPerson: formData.contactPerson,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      employeeCount: Number(formData.employeeCount),
      monthlyTests: 0,
      totalRevenue: 0,
      status: "active",
      discount: Number(formData.discount) || 0,
      contractStart: new Date().toISOString().split("T")[0],
      contractEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      createdAt: new Date().toISOString().split("T")[0],
    }
    setAccounts([...accounts, newAccount])
    toast({ title: "Corporate account created", description: `${formData.name} has been added.`, variant: "success" })
    setDialogOpen(false)
    setFormData({
      name: "",
      contactPerson: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      employeeCount: "",
      discount: "",
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Corporate & B2B"
        description="Manage corporate accounts and employer health programs"
        actions={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Corporate Account
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>Create Corporate Account</DialogTitle>
                <DialogDescription>
                  Add a new corporate client to the system
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Company Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPerson">Contact Person</Label>
                    <Input
                      id="contactPerson"
                      value={formData.contactPerson}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contactPerson: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) =>
                        setFormData({ ...formData, state: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="employeeCount">Employee Count</Label>
                    <Input
                      id="employeeCount"
                      type="number"
                      value={formData.employeeCount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          employeeCount: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="discount">Discount (%)</Label>
                    <Input
                      id="discount"
                      type="number"
                      value={formData.discount}
                      onChange={(e) =>
                        setFormData({ ...formData, discount: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate}>Create Account</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Building2 className="h-5 w-5" />}
          label="Total Corporate Accounts"
          value={stats.total}
        />
        <StatCard
          icon={<FileText className="h-5 w-5" />}
          label="Active Contracts"
          value={stats.active}
        />
        <StatCard
          icon={<Users className="h-5 w-5" />}
          label="Total Employees Covered"
          value={stats.totalEmployees.toLocaleString()}
        />
        <StatCard
          icon={<IndianRupee className="h-5 w-5" />}
          label="Revenue from Corporate"
          value={formatCurrency(stats.totalRevenue)}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Corporate Account</CardTitle>
            <CardDescription>Top corporate accounts by revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueChartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <RechartsTooltip
                    formatter={(value: unknown) => formatCurrency(Number(value))}
                  />
                  <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Employee Coverage</CardTitle>
            <CardDescription>Distribution of covered employees</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={employeeCoverageData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }: any) => `${name} ${(percent).toFixed(0)}%`}
                  >
                    {employeeCoverageData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <SearchInput
              placeholder="Search by company name or contact..."
              value={search}
              onSearch={(v) => { setSearch(v); setCurrentPage(1) }}
              className="w-72"
            />
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1) }}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
            <Select value={contractFilter} onValueChange={(v) => { setContractFilter(v); setCurrentPage(1) }}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Contract Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Contracts</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="terminated">Terminated</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredAccounts.length === 0 ? (
            <EmptyState
              icon={<Building2 className="h-6 w-6" />}
              title="No corporate accounts found"
              description="Try adjusting your search or filter criteria."
            />
          ) : (
            <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead>Company Name</TableHead>
                    <TableHead>Contact Person</TableHead>
                    <TableHead>Phone & Email</TableHead>
                    <TableHead className="text-right">Employees</TableHead>
                    <TableHead>Contract Type</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {slicedAccounts.map((acc) => {
                    const contracts = getContractsForAccount(acc.id)
                    const isExpanded = expandedId === acc.id
                    return (
                      <>
                        <TableRow
                          key={acc.id}
                          className="cursor-pointer"
                          onClick={() =>
                            setExpandedId(isExpanded ? null : acc.id)
                          }
                        >
                          <TableCell>
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            )}
                          </TableCell>
                          <TableCell className="font-medium">{acc.name}</TableCell>
                          <TableCell>{acc.contactPerson}</TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Phone className="h-3 w-3" />
                                {acc.phone}
                              </div>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Mail className="h-3 w-3" />
                                {acc.email}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {acc.employeeCount.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            {contracts.map((c) => (
                              <Badge
                                key={c.id}
                                variant={contractTypeStyles[c.status]}
                                className="mr-1"
                              >
                                {c.status}
                              </Badge>
                            ))}
                            {contracts.length === 0 && (
                              <span className="text-xs text-muted-foreground">
                                No contract
                              </span>
                            )}
                          </TableCell>
                          <TableCell>{acc.discount}%</TableCell>
                          <TableCell>
                            <Badge variant={statusStyles[acc.status]}>
                              {acc.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                        {isExpanded && (
                          <TableRow key={`${acc.id}-expanded`}>
                            <TableCell colSpan={8} className="bg-muted/30 p-4">
                              <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-3">
                                  <div className="flex items-center gap-2 text-sm">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    {acc.address}, {acc.city}, {acc.state}
                                  </div>
                                  <div className="flex items-center gap-2 text-sm">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    Contract: {formatDate(acc.contractStart)} -{" "}
                                    {formatDate(acc.contractEnd)}
                                  </div>
                                  <div className="flex items-center gap-2 text-sm">
                                    <IndianRupee className="h-4 w-4 text-muted-foreground" />
                                    Monthly Tests: {acc.monthlyTests}
                                  </div>
                                  <div className="flex items-center gap-2 text-sm">
                                    <IndianRupee className="h-4 w-4 text-muted-foreground" />
                                    Total Revenue:{" "}
                                    {formatCurrency(acc.totalRevenue)}
                                  </div>
                                </div>
                                <div className="space-y-3">
                                  <h4 className="text-sm font-semibold">
                                    Contracts & Health Programs
                                  </h4>
                                  {contracts.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">
                                      No active contracts
                                    </p>
                                  ) : (
                                    contracts.map((c) => (
                                      <div
                                        key={c.id}
                                        className="rounded-lg border bg-background p-3"
                                      >
                                        <div className="mb-1 flex items-center justify-between">
                                          <span className="text-sm font-medium">
                                            {c.name}
                                          </span>
                                          <Badge
                                            variant={
                                              contractTypeStyles[c.status]
                                            }
                                          >
                                            {c.status}
                                          </Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                          Negotiated:{" "}
                                          {formatCurrency(c.negotiatedPrice)}{" "}
                                          /patient
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          Discount: {c.discount}% | Tests:{" "}
                                          {c.testIds.length}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          {formatDate(c.startDate)} -{" "}
                                          {formatDate(c.endDate)}
                                        </p>
                                      </div>
                                    ))
                                  )}
                                  <div className="flex gap-2 pt-2">
                                    <Button size="sm" variant="outline" onClick={() => navigate(`/corporate/accounts/${acc.id}`)}>
                                      <Eye className="mr-1 h-3 w-3" />
                                      View Details
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => toast({ title: acc.contactPerson, description: acc.email })}>
                                      <Phone className="mr-1 h-3 w-3" />
                                      Contact
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
