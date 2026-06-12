"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { Plus, Building2, MapPin, Phone, Users, Beaker, IndianRupee, Edit, Trash2 } from "lucide-react"
import type { Branch } from "@/types"
import { formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { SearchInput } from "@/components/ui/search-input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PageContainer, type PageStatus } from "@/components/shared/page-container"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { getBranches, deleteBranch } from "@/mock/services"
import { branches as mockBranches } from "@/mock/data/branches"
import { useToast } from "@/hooks/use-toast"
import { useAppStore } from "@/store/appStore"

const cities = [...new Set(mockBranches.map((b) => b.city))]

export default function BranchesList() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { setBreadcrumbs } = useAppStore()
  const [branches, setBranches] = useState<Branch[]>([])
  const [pageStatus, setPageStatus] = useState<PageStatus>("loading")
  const [search, setSearch] = useState("")
  const [cityFilter, setCityFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id?: string }>({ open: false })
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    setBreadcrumbs([{ label: "Branches" }])
  }, [])

  const fetchBranches = useCallback(async () => {
    setPageStatus("loading")
    try {
      const result = await getBranches()
      setBranches(result)
      setPageStatus(result.length === 0 ? "empty" : "success")
    } catch {
      setPageStatus("error")
    }
  }, [])

  useEffect(() => {
    fetchBranches()
  }, [fetchBranches])

  const filteredBranches = useMemo(() => {
    return branches.filter((b) => {
      const matchesSearch =
        !search ||
        b.name.toLowerCase().includes(search.toLowerCase()) ||
        b.code.toLowerCase().includes(search.toLowerCase()) ||
        b.city.toLowerCase().includes(search.toLowerCase())
      const matchesCity = cityFilter === "all" || b.city === cityFilter
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && b.isActive) ||
        (statusFilter === "inactive" && !b.isActive)
      return matchesSearch && matchesCity && matchesStatus
    })
  }, [branches, search, cityFilter, statusFilter])

  const handleDelete = async () => {
    if (!deleteDialog.id) return
    setDeleting(true)
    try {
      await deleteBranch(deleteDialog.id)
      toast({ title: "Branch deleted", variant: "success" })
      setDeleteDialog({ open: false })
      fetchBranches()
    } catch {
      toast({ title: "Failed to delete branch", variant: "destructive" })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <PageContainer
        title="Branch Management"
        description="Manage all laboratory branches"
        status={pageStatus}
        loadingType="card"
        loadingCount={6}
        onRetry={fetchBranches}
        emptyIcon={<Building2 className="h-8 w-8" />}
        emptyTitle="No branches found"
        emptyDescription="Create your first branch to get started"
        emptyAction={
          <Button onClick={() => navigate("/branches/create")}>
            <Plus className="mr-2 h-4 w-4" />
            Create Branch
          </Button>
        }
        actions={
          <Button onClick={() => navigate("/branches/create")}>
            <Plus className="mr-2 h-4 w-4" />
            Create Branch
          </Button>
        }
      >
        <Card>
          <CardContent className="p-6">
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <SearchInput
                placeholder="Search by name, code, or city..."
                value={search}
                onSearch={setSearch}
                className="w-72"
              />
              <Select value={cityFilter} onValueChange={setCityFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="City" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {cities.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredBranches.map((branch) => (
                <Card
                  key={branch.id}
                  className="cursor-pointer transition-all hover:shadow-md"
                  onClick={() => navigate(`/branches/${branch.id}`)}
                >
                  <CardContent className="p-5">
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="rounded-lg bg-primary/10 p-2 text-primary">
                          <Building2 className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{branch.name}</h3>
                          <p className="text-xs text-muted-foreground">{branch.code}</p>
                        </div>
                      </div>
                      <Badge variant={branch.isActive ? "success" : "secondary"}>
                        {branch.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>

                    <div className="space-y-1.5 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>{branch.city}, {branch.state}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-3.5 w-3.5" />
                        <span>{branch.phone}</span>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t pt-3 text-sm">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{branch.staffCount} staff</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Beaker className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{branch.monthlyTests}/mo</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                        <IndianRupee className="h-3.5 w-3.5" />
                        <span>{formatCurrency(branch.monthlyRevenue)}/mo</span>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-1 border-t pt-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/branches/${branch.id}`)
                        }}
                      >
                        View
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/branches/${branch.id}/edit`)
                        }}
                      >
                        <Edit className="mr-1 h-3 w-3" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-auto h-7 px-2 text-xs text-destructive hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation()
                          setDeleteDialog({ open: true, id: branch.id })
                        }}
                      >
                        <Trash2 className="mr-1 h-3 w-3" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredBranches.length === 0 && (
              <div className="py-12 text-center text-sm text-muted-foreground">
                No branches match the current filters
              </div>
            )}
          </CardContent>
        </Card>
      </PageContainer>

      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open })}
        title="Delete Branch"
        description="Are you sure you want to delete this branch? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
        isLoading={deleting}
      />
    </>
  )
}
