"use client"

import { useState, useMemo, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Building2, Phone, Mail, MapPin, Users, Beaker, IndianRupee, Edit, Calendar } from "lucide-react"
import { branches } from "@/mock/data/branches"
import { formatCurrency, formatDate } from "@/lib/utils"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ErrorState } from "@/components/shared/error-state"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { useAppStore } from "@/store/appStore"

interface StaffMember {
  id: string
  name: string
  role: string
  email: string
  status: "active" | "inactive" | "on-leave"
}

const staffList: StaffMember[] = [
  { id: "STF001", name: "Rajesh Patil", role: "Branch Manager", email: "rajesh.patil@lifsyslab.com", status: "active" },
  { id: "STF002", name: "Sneha Kulkarni", role: "Lab Technician", email: "sneha.kulkarni@lifsyslab.com", status: "active" },
  { id: "STF003", name: "Amit Deshmukh", role: "Phlebotomist", email: "amit.deshmukh@lifsyslab.com", status: "active" },
  { id: "STF004", name: "Pooja Sharma", role: "Receptionist", email: "pooja.sharma@lifsyslab.com", status: "active" },
  { id: "STF005", name: "Vikram Joshi", role: "Lab Technician", email: "vikram.joshi@lifsyslab.com", status: "on-leave" },
  { id: "STF006", name: "Meera Nair", role: "Billing Staff", email: "meera.nair@lifsyslab.com", status: "active" },
  { id: "STF007", name: "Sunil Verma", role: "Sample Collector", email: "sunil.verma@lifsyslab.com", status: "active" },
  { id: "STF008", name: "Anita Reddy", role: "Quality Analyst", email: "anita.reddy@lifsyslab.com", status: "inactive" },
]

const monthlyData = [
  { month: "Jan", tests: 3200, revenue: 1280000 },
  { month: "Feb", tests: 3500, revenue: 1400000 },
  { month: "Mar", tests: 3800, revenue: 1520000 },
  { month: "Apr", tests: 3400, revenue: 1360000 },
  { month: "May", tests: 4100, revenue: 1640000 },
  { month: "Jun", tests: 4200, revenue: 1680000 },
]

const maxTests = Math.max(...monthlyData.map((m) => m.tests))
const maxRevenue = Math.max(...monthlyData.map((m) => m.revenue))

function getStatusBadge(status: string) {
  switch (status) {
    case "active":
      return <Badge variant="success">Active</Badge>
    case "inactive":
      return <Badge variant="secondary">Inactive</Badge>
    case "on-leave":
      return <Badge variant="warning">On Leave</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export default function BranchDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { setBreadcrumbs } = useAppStore()

  useEffect(() => {
    setBreadcrumbs([{ label: "Branches", href: "/branches" }, { label: "Branch Details" }])
  }, [])

  const branch = useMemo(() => branches.find((b) => b.id === id), [id])

  if (!branch) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Branch Not Found"
          description="The requested branch could not be found."
          actions={
            <Button variant="outline" onClick={() => navigate("/branches")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Branches
            </Button>
          }
        />
        <ErrorState
          title="Branch Not Found"
          message={`No branch exists with ID: ${id}`}
          onRetry={() => navigate("/branches")}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={branch.name}
        description={`Branch Code: ${branch.code}`}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/branches")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button onClick={() => navigate(`/branches/${branch.id}/edit`)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Branch
            </Button>
          </div>
        }
      />

      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-primary/10 p-3 text-primary">
                <Building2 className="h-8 w-8" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold">{branch.name}</h2>
                  <Badge variant={branch.isActive ? "success" : "secondary"}>
                    {branch.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">Code: {branch.code}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  Staff Count
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{branch.staffCount}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Beaker className="h-4 w-4" />
                  Monthly Tests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{branch.monthlyTests.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
                  <IndianRupee className="h-4 w-4" />
                  Monthly Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatCurrency(branch.monthlyRevenue)}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Branch Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{branch.address}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{branch.city}, {branch.state}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{branch.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{branch.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Established: {formatDate(branch.createdAt, "long")}</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="staff">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Staff Members</CardTitle>
              <CardDescription>{staffList.length} employees at this branch</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staffList.map((staff) => (
                    <TableRow key={staff.id}>
                      <TableCell className="font-medium">{staff.name}</TableCell>
                      <TableCell>{staff.role}</TableCell>
                      <TableCell>{staff.email}</TableCell>
                      <TableCell>{getStatusBadge(staff.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Beaker className="h-4 w-4" />
                  Monthly Test Volume
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-2 h-40 pt-4">
                  {monthlyData.map((item) => (
                    <div key={item.month} className="flex flex-1 flex-col items-center gap-1">
                      <span className="text-xs text-muted-foreground">{item.tests}</span>
                      <div
                        className="w-full rounded-t bg-primary/80 transition-all hover:bg-primary"
                        style={{ height: `${(item.tests / maxTests) * 100}%` }}
                      />
                      <span className="text-xs text-muted-foreground">{item.month}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <IndianRupee className="h-4 w-4" />
                  Monthly Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-2 h-40 pt-4">
                  {monthlyData.map((item) => (
                    <div key={item.month} className="flex flex-1 flex-col items-center gap-1">
                      <span className="text-xs text-muted-foreground">
                        {(item.revenue / 100000).toFixed(1)}L
                      </span>
                      <div
                        className="w-full rounded-t bg-emerald-500/80 transition-all hover:bg-emerald-500"
                        style={{ height: `${(item.revenue / maxRevenue) * 100}%` }}
                      />
                      <span className="text-xs text-muted-foreground">{item.month}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Monthly Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead className="text-right">Tests</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {monthlyData.map((item) => (
                    <TableRow key={item.month}>
                      <TableCell className="font-medium">{item.month}</TableCell>
                      <TableCell className="text-right">{item.tests.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.revenue)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
