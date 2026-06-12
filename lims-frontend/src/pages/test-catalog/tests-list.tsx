"use client"

import { useState, useMemo, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { useToast } from "@/hooks/use-toast"
import {
  Plus, Search, Edit2, ToggleLeft, ToggleRight, ChevronDown, ChevronRight,
  Beaker, FlaskConical, Microscope, Dna, Stethoscope, Eye
} from "lucide-react"
import type { Test } from "@/types"
import { tests, testCategories } from "@/mock/data/tests"
import { formatCurrency } from "@/lib/utils"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { SearchInput } from "@/components/ui/search-input"
import { Input } from "@/components/ui/input"
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
import { Skeleton } from "@/components/ui/skeleton"
import { Pagination } from "@/components/ui/pagination"
import { EmptyState } from "@/components/ui/empty-state"
import { Switch } from "@/components/ui/switch"
import { useAppStore } from "@/store/appStore"
import { useEffect } from "react"

const categories = [...new Set(tests.map((t) => t.category))]
const departments = [...new Set(tests.map((t) => t.department))]

export default function TestsList() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { setBreadcrumbs } = useAppStore()
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(false)
  const pageSize = 15

  useEffect(() => {
    setBreadcrumbs([{ label: "Test Catalog" }])
  }, [])

  const filteredTests = useMemo(() => {
    return tests.filter((t) => {
      const matchesSearch =
        !search ||
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.code.toLowerCase().includes(search.toLowerCase())
      const matchesCategory =
        categoryFilter === "all" || t.category === categoryFilter
      const matchesDepartment =
        departmentFilter === "all" || t.department === departmentFilter
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && t.isActive) ||
        (statusFilter === "inactive" && !t.isActive)
      return matchesSearch && matchesCategory && matchesDepartment && matchesStatus
    })
  }, [search, categoryFilter, departmentFilter, statusFilter])

  const slicedTests = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredTests.slice(start, start + pageSize)
  }, [filteredTests, currentPage, pageSize])

  const totalPages = Math.ceil(filteredTests.length / pageSize)

  const toggleExpand = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Test Catalog"
        description="Manage all laboratory tests and their parameters"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/tests/categories")}>
              Categories
            </Button>
            <Button variant="outline" onClick={() => navigate("/tests/packages")}>
              Packages
            </Button>
          </div>
        }
      />

      <Card>
        <CardContent className="p-6">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <SearchInput
              placeholder="Search by test name or code..."
              value={search}
              onSearch={(v) => { setSearch(v); setCurrentPage(1) }}
              className="w-64"
            />
            <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setCurrentPage(1) }}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={departmentFilter} onValueChange={(v) => { setDepartmentFilter(v); setCurrentPage(1) }}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1) }}>
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

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredTests.length === 0 ? (
            <EmptyState
              icon={<Beaker className="h-6 w-6" />}
              title="No tests found"
              description="Try adjusting your search or filter criteria."
            />
          ) : (
            <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>Test Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead>TAT</TableHead>
                  <TableHead className="text-right">Parameters</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {slicedTests.map((test) => (
                  <>
                    <TableRow
                      key={test.id}
                      className="cursor-pointer"
                      onClick={() => toggleExpand(test.id)}
                    >
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleExpand(test.id)
                          }}
                        >
                          {expandedRows.has(test.id) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className="font-mono text-xs font-medium">
                        {test.code}
                      </TableCell>
                      <TableCell className="font-medium">{test.name}</TableCell>
                      <TableCell>{test.category}</TableCell>
                      <TableCell>{test.department}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(test.price)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {test.turnaroundTime}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {test.parameters.length}
                      </TableCell>
                      <TableCell>
                        <Badge variant={test.isActive ? "success" : "secondary"}>
                          {test.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={(e) => {
                              e.stopPropagation()
                              navigate(`/tests/${test.id}`)
                            }}
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={(e) => {
                              e.stopPropagation()
                              navigate(`/tests/${test.id}/edit`)
                            }}
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Switch
                            checked={test.isActive}
                            onCheckedChange={(checked) => toast({ title: "Status Changed", description: `Test status has been updated to ${checked ? "active" : "inactive"}`, variant: "success" })}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                    {expandedRows.has(test.id) && (
                      <TableRow key={`${test.id}-params`}>
                        <TableCell colSpan={10} className="bg-muted/30 p-4">
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">
                              Parameters ({test.parameters.length})
                            </p>
                            {test.preparation && (
                              <p className="text-xs text-muted-foreground">
                                <strong>Preparation:</strong> {test.preparation}
                              </p>
                            )}
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="text-xs">Parameter</TableHead>
                                  <TableHead className="text-xs">Unit</TableHead>
                                  <TableHead className="text-xs">Reference Range</TableHead>
                                  <TableHead className="text-xs">Method</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {test.parameters.map((param) => (
                                  <TableRow key={param.id}>
                                    <TableCell className="text-xs font-medium">
                                      {param.name}
                                    </TableCell>
                                    <TableCell className="text-xs">{param.unit}</TableCell>
                                    <TableCell className="text-xs">{param.referenceRange}</TableCell>
                                    <TableCell className="text-xs">{param.method}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
              </TableBody>
            </Table>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
