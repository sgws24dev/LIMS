"use client"

import { useState, useMemo, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, BarChart3, TrendingUp, Beaker, IndianRupee } from "lucide-react"
import { branches } from "@/mock/data/branches"
import { formatCurrency } from "@/lib/utils"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
import { Separator } from "@/components/ui/separator"
import { useAppStore } from "@/store/appStore"

const monthlyPerformance = [
  { month: "Jan", LSDMUM: 1280000, LSDDEL: 1150000, LSDBLR: 1050000, LSDHYD: 940000, LSDCHE: 850000, LSDPUN: 720000 },
  { month: "Feb", LSDMUM: 1350000, LSDDEL: 1200000, LSDBLR: 1100000, LSDHYD: 980000, LSDCHE: 880000, LSDPUN: 750000 },
  { month: "Mar", LSDMUM: 1420000, LSDDEL: 1280000, LSDBLR: 1150000, LSDHYD: 1020000, LSDCHE: 900000, LSDPUN: 780000 },
  { month: "Apr", LSDMUM: 1380000, LSDDEL: 1250000, LSDBLR: 1120000, LSDHYD: 1000000, LSDCHE: 870000, LSDPUN: 760000 },
  { month: "May", LSDMUM: 1550000, LSDDEL: 1380000, LSDBLR: 1250000, LSDHYD: 1120000, LSDCHE: 1000000, LSDPUN: 850000 },
  { month: "Jun", LSDMUM: 1680000, LSDDEL: 1520000, LSDBLR: 1400000, LSDHYD: 1240000, LSDCHE: 1120000, LSDPUN: 960000 },
]

const testVolumeMonthly = [
  { month: "Jan", LSDMUM: 3200, LSDDEL: 2900, LSDBLR: 2600, LSDHYD: 2300, LSDCHE: 2100, LSDPUN: 1800 },
  { month: "Feb", LSDMUM: 3400, LSDDEL: 3100, LSDBLR: 2800, LSDHYD: 2500, LSDCHE: 2200, LSDPUN: 1900 },
  { month: "Mar", LSDMUM: 3600, LSDDEL: 3300, LSDBLR: 3000, LSDHYD: 2700, LSDCHE: 2400, LSDPUN: 2000 },
  { month: "Apr", LSDMUM: 3500, LSDDEL: 3200, LSDBLR: 2900, LSDHYD: 2600, LSDCHE: 2300, LSDPUN: 1950 },
  { month: "May", LSDMUM: 3900, LSDDEL: 3500, LSDBLR: 3200, LSDHYD: 2900, LSDCHE: 2600, LSDPUN: 2200 },
  { month: "Jun", LSDMUM: 4200, LSDDEL: 3800, LSDBLR: 3500, LSDHYD: 3100, LSDCHE: 2800, LSDPUN: 2400 },
]

const codeToId: Record<string, string> = {
  LSDMUM: "BRH001",
  LSDDEL: "BRH002",
  LSDBLR: "BRH003",
  LSDHYD: "BRH004",
  LSDCHE: "BRH005",
  LSDPUN: "BRH006",
}

export default function BranchPerformance() {
  const navigate = useNavigate()
  const { setBreadcrumbs } = useAppStore()
  const [selectedBranch1, setSelectedBranch1] = useState("BRH001")
  const [selectedBranch2, setSelectedBranch2] = useState("BRH002")
  const [selectedBranch3, setSelectedBranch3] = useState("BRH003")

  useEffect(() => {
    setBreadcrumbs([{ label: "Branches", href: "/branches" }, { label: "Performance" }])
  }, [])

  const selectedIds = [selectedBranch1, selectedBranch2, selectedBranch3].filter(Boolean)
  const branchOptions = branches.filter((b) => b.isActive)

  const getBranchData = useMemo(() => {
    return branches
      .filter((b) => selectedIds.includes(b.id))
      .map((b) => {
        const codeKey = b.code.replace("LSD-", "")
        const revData = monthlyPerformance.map((m) => ({
          month: m.month,
          value: m[codeKey as keyof typeof m] as number,
        }))
        const testData = testVolumeMonthly.map((m) => ({
          month: m.month,
          value: m[codeKey as keyof typeof m] as number,
        }))
        return { branch: b, revenue: revData, tests: testData }
      })
  }, [selectedIds.join(",")])

  const maxRevenue = Math.max(
    ...monthlyPerformance.flatMap((m) =>
      selectedIds.map((id) => {
        const b = branches.find((b) => b.id === id)
        if (!b) return 0
        const key = b.code.replace("LSD-", "")
        return (m[key as keyof typeof m] as number) || 0
      })
    )
  )

  const maxTests = Math.max(
    ...testVolumeMonthly.flatMap((m) =>
      selectedIds.map((id) => {
        const b = branches.find((b) => b.id === id)
        if (!b) return 0
        const key = b.code.replace("LSD-", "")
        return (m[key as keyof typeof m] as number) || 0
      })
    )
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Branch Performance"
        description="Compare performance across branches"
        actions={
          <Button variant="outline" onClick={() => navigate("/branches")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Branches
          </Button>
        }
      />

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Branch 1</p>
              <Select value={selectedBranch1} onValueChange={setSelectedBranch1}>
                <SelectTrigger className="w-56">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {branchOptions.map((b) => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Branch 2</p>
              <Select value={selectedBranch2} onValueChange={setSelectedBranch2}>
                <SelectTrigger className="w-56">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {branchOptions.map((b) => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Branch 3</p>
              <Select value={selectedBranch3} onValueChange={setSelectedBranch3}>
                <SelectTrigger className="w-56">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {branchOptions.map((b) => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {getBranchData.length > 0 && (
        <>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <IndianRupee className="h-4 w-4" />
                  Revenue Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {monthlyPerformance.map((month) => (
                    <div key={month.month}>
                      <p className="mb-2 text-xs font-medium text-muted-foreground">{month.month}</p>
                      <div className="space-y-2">
                        {getBranchData.map(({ branch }) => {
                          const codeKey = branch.code.replace("LSD-", "")
                          const value = month[codeKey as keyof typeof month] as number
                          return (
                            <div key={branch.id} className="flex items-center gap-2">
                              <span className="w-32 truncate text-xs">{branch.code}</span>
                              <div className="flex-1">
                                <div className="h-4 w-full rounded bg-muted">
                                  <div
                                    className="h-4 rounded bg-primary transition-all"
                                    style={{ width: `${(value / maxRevenue) * 100}%` }}
                                  />
                                </div>
                              </div>
                              <span className="w-20 text-right text-xs font-medium">
                                {formatCurrency(value)}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Beaker className="h-4 w-4" />
                  Test Volume Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {testVolumeMonthly.map((month) => (
                    <div key={month.month}>
                      <p className="mb-2 text-xs font-medium text-muted-foreground">{month.month}</p>
                      <div className="space-y-2">
                        {getBranchData.map(({ branch }) => {
                          const codeKey = branch.code.replace("LSD-", "")
                          const value = month[codeKey as keyof typeof month] as number
                          return (
                            <div key={branch.id} className="flex items-center gap-2">
                              <span className="w-32 truncate text-xs">{branch.code}</span>
                              <div className="flex-1">
                                <div className="h-4 w-full rounded bg-muted">
                                  <div
                                    className="h-4 rounded bg-emerald-500 transition-all"
                                    style={{ width: `${(value / maxTests) * 100}%` }}
                                  />
                                </div>
                              </div>
                              <span className="w-16 text-right text-xs font-medium">
                                {value.toLocaleString()}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4" />
                Growth Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 h-48 pt-4">
                {monthlyPerformance.map((month, idx) => (
                  <div key={month.month} className="flex flex-1 flex-col items-center gap-1">
                    {getBranchData.map(({ branch }, bIdx) => {
                      const codeKey = branch.code.replace("LSD-", "")
                      const value = month[codeKey as keyof typeof month] as number
                      const prevMonth = idx > 0 ? monthlyPerformance[idx - 1][codeKey as keyof typeof month] as number : value
                      const growth = prevMonth > 0 ? ((value - prevMonth) / prevMonth) * 100 : 0
                      const barColors = ["bg-blue-500", "bg-emerald-500", "bg-amber-500"]
                      return (
                        <div key={branch.id} className="flex w-full items-end justify-center gap-0.5">
                          <div
                            className={`w-3 rounded-t ${barColors[bIdx % 3]} transition-all hover:opacity-80`}
                            style={{ height: `${(value / maxRevenue) * 100}%` }}
                            title={`${branch.code}: ${formatCurrency(value)} (${growth.toFixed(1)}%)`}
                          />
                        </div>
                      )
                    })}
                    <span className="text-xs text-muted-foreground">{month.month}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
                {getBranchData.map(({ branch }, idx) => {
                  const barColors = ["bg-blue-500", "bg-emerald-500", "bg-amber-500"]
                  return (
                    <div key={branch.id} className="flex items-center gap-1">
                      <div className={`h-3 w-3 rounded ${barColors[idx % 3]}`} />
                      <span>{branch.code}</span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tabular Data</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Branch</TableHead>
                    <TableHead>Staff</TableHead>
                    <TableHead className="text-right">Monthly Tests</TableHead>
                    <TableHead className="text-right">Monthly Revenue</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getBranchData
                    .sort((a, b) => b.branch.monthlyRevenue - a.branch.monthlyRevenue)
                    .map(({ branch }) => (
                      <TableRow
                        key={branch.id}
                        className="cursor-pointer"
                        onClick={() => navigate(`/branches/${branch.id}`)}
                      >
                        <TableCell className="font-medium">{branch.name}</TableCell>
                        <TableCell>{branch.staffCount}</TableCell>
                        <TableCell className="text-right">{branch.monthlyTests.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{formatCurrency(branch.monthlyRevenue)}</TableCell>
                        <TableCell>
                          <Badge variant={branch.isActive ? "success" : "secondary"}>
                            {branch.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
