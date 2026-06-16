import { useEffect, useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { useUIStore } from "@/store/uiStore"
import { PageContainer } from "@/shared/shared/page-container"
import { DataTable, type ColumnDef } from "@/shared/ui/data-table"
import { Button } from "@/shared/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/shared/ui/tabs"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/shared/ui/select"
import { Plus, Search } from "lucide-react"
import { getAssets, searchAssets, type Asset } from "@/services/api/facilities"
import { AssetStatusBadge } from "../components/asset-status-badge"

const statusFilterOptions = [
  { value: "", label: "All Statuses" },
  { value: "Active", label: "Active" },
  { value: "UnderMaintenance", label: "Under Maintenance" },
  { value: "Decommissioned", label: "Decommissioned" },
  { value: "Disposed", label: "Disposed" },
]

export default function AssetsList() {
  const navigate = useNavigate()
  const { setBreadcrumbs } = useUIStore()
  const [data, setData] = useState<Asset[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [categoryTab, setCategoryTab] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      if (debouncedQuery) {
        const result = await searchAssets({
          q: debouncedQuery,
          category: categoryTab || undefined,
          status: statusFilter || undefined,
          page: 1, pageSize: 50,
        })
        setData(result.items)
      } else {
        const result = await getAssets({
          category: categoryTab || undefined,
          status: statusFilter || undefined,
          page: 1, pageSize: 50,
        })
        setData(result.items)
      }
    } catch {
      setError("Failed to load assets.")
    } finally {
      setIsLoading(false)
    }
  }, [debouncedQuery, categoryTab, statusFilter])

  useEffect(() => {
    setBreadcrumbs([{ label: "Facilities" }, { label: "Assets" }])
  }, [setBreadcrumbs])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const columns: ColumnDef<Asset>[] = [
    { id: "name", header: "Name", accessorKey: "name", sortable: true, filterable: true },
    { id: "identifier", header: "Identifier", accessorKey: "identifier" },
    { id: "category", header: "Category", accessorKey: "category" },
    {
      id: "assetType",
      header: "Type",
      cell: (row) => (
        <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
          {row.assetType}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (row) => <AssetStatusBadge status={row.status} />,
    },
    { id: "location", header: "Location", accessorKey: "location" },
    { id: "facilityName", header: "Facility", accessorKey: "facilityName" },
    {
      id: "currentValue",
      header: "Value",
      accessorKey: "currentValue",
      cell: (row) => row.currentValue != null ? `$${row.currentValue.toLocaleString()}` : "—",
    },
  ]

  return (
    <PageContainer
      title="Asset Register"
      description="Manage all equipment, instruments, and assets"
      status={error ? "error" : isLoading ? "loading" : data.length === 0 && !debouncedQuery ? "empty" : "success"}
      errorMessage={error ?? undefined}
      onRetry={fetchData}
      emptyTitle="No assets found"
      emptyDescription="Add your first asset to get started."
      emptyAction={
        <Button size="sm" onClick={() => navigate("/facilities/assets/create")}>
          <Plus className="mr-1 h-4 w-4" /> Add Asset
        </Button>
      }
      actions={
        <Button size="sm" onClick={() => navigate("/facilities/assets/create")}>
          <Plus className="mr-1 h-4 w-4" /> Add Asset
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Tabs value={categoryTab} onValueChange={(v) => setCategoryTab(v === "all" ? "" : v)}>
            <TabsList>
              <TabsTrigger value="">All</TabsTrigger>
              <TabsTrigger value="Instruments">Instruments</TabsTrigger>
              <TabsTrigger value="Equipment">Equipment</TabsTrigger>
              <TabsTrigger value="Vehicles">Vehicles</TabsTrigger>
              <TabsTrigger value="Other">Other</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                className="flex h-9 w-[200px] rounded-lg border border-input bg-background pl-8 pr-3 text-sm shadow-sm outline-none focus:ring-2 focus:ring-primary/10"
                placeholder="Search assets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                {statusFilterOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={data}
          onRowClick={(row) => navigate(`/facilities/assets/${row.id}`)}
          filterPlaceholder="Filter assets..."
          pageSize={10}
          exportable
          exportFilename="assets"
        />
      </div>
    </PageContainer>
  )
}
