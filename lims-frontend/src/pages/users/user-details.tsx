"use client"

import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  ArrowLeft,
  Edit,
  Shield,
  Ban,
  KeyRound,
  Activity,
  Monitor,
  MapPin,
  Globe,
  Smartphone,
} from "lucide-react"
import type { User } from "@/types"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { formatDate } from "@/lib/utils"
import { getUserById } from "@/mock/services"
import { useToast } from "@/hooks/use-toast"
import { branches } from "@/mock/data/branches"
import { useAppStore } from "@/store/appStore"

const roleLabels: Record<string, string> = {
  super_admin: "Super Admin",
  lab_admin: "Lab Admin",
  branch_manager: "Branch Manager",
  technician: "Technician",
  doctor: "Doctor",
  receptionist: "Receptionist",
  phlebotomist: "Phlebotomist",
  billing: "Billing",
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

const mockActivityLog = [
  { id: "1", action: "Logged in", module: "Authentication", timestamp: "2026-06-10T08:30:00Z", ip: "192.168.1.101" },
  { id: "2", action: "Updated patient record PAT003", module: "Patients", timestamp: "2026-06-10T09:15:00Z", ip: "192.168.1.101" },
  { id: "3", action: "Created booking BKG045", module: "Bookings", timestamp: "2026-06-09T14:22:00Z", ip: "192.168.1.101" },
  { id: "4", action: "Viewed test results", module: "Results", timestamp: "2026-06-09T11:00:00Z", ip: "192.168.1.101" },
  { id: "5", action: "Generated invoice INV023", module: "Billing", timestamp: "2026-06-08T16:45:00Z", ip: "192.168.1.102" },
  { id: "6", action: "Changed password", module: "Settings", timestamp: "2026-06-07T10:30:00Z", ip: "192.168.1.101" },
  { id: "7", action: "Exported patient report", module: "Reports", timestamp: "2026-06-06T15:00:00Z", ip: "192.168.1.101" },
]

const mockSessions = [
  { id: "1", ip: "192.168.1.101", device: "Chrome 125 / Windows 11", location: "Mumbai, India", lastActive: "2026-06-10T08:30:00Z", isCurrent: true },
  { id: "2", ip: "192.168.1.102", device: "Safari 18 / macOS 15", location: "Mumbai, India", lastActive: "2026-06-08T16:45:00Z", isCurrent: false },
  { id: "3", ip: "10.0.0.45", device: "Mobile App / iOS 19", location: "Mumbai, India", lastActive: "2026-06-07T12:30:00Z", isCurrent: false },
  { id: "4", ip: "203.0.113.50", device: "Firefox 128 / Android 14", location: "Pune, India", lastActive: "2026-06-05T09:00:00Z", isCurrent: false },
]

export default function UserDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const { setBreadcrumbs } = useAppStore()

  useEffect(() => {
    setBreadcrumbs([{ label: "Users", href: "/users" }, { label: "User Details" }])
  }, [])

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getUserById(id).then((u) => {
      if (!u) {
        toast({ title: "User not found", variant: "destructive" })
        navigate("/users")
        return
      }
      setUser(u)
      setLoading(false)
    })
  }, [id, navigate, toast])

  const branchName = user?.branchId
    ? branches.find((b) => b.id === user.branchId)?.name
    : undefined

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl md:col-span-2" />
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="space-y-6">
      <PageHeader
        title={user.name}
        description="User details and activity"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/users")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button onClick={() => navigate(`/users/${user.id}/edit`)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="mb-3 h-20 w-20">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="text-lg">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-semibold">{user.name}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <Badge variant="outline" className="mt-2">
                {user.id}
              </Badge>
              <div className="mt-4 flex items-center gap-2">
                <Badge
                  variant={user.isActive ? "success" : "secondary"}
                >
                  {user.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>User Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-muted-foreground">Role</dt>
                <dd className="mt-1 flex items-center gap-1 font-medium">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  {roleLabels[user.role] || user.role}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Phone</dt>
                <dd className="mt-1 font-medium">{user.phone}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Branch</dt>
                <dd className="mt-1 font-medium">{branchName || "N/A"}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Last Login</dt>
                <dd className="mt-1 font-medium">
                  {user.lastLogin ? formatDate(user.lastLogin, "datetime") : "Never"}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Created</dt>
                <dd className="mt-1 font-medium">
                  {formatDate(user.createdAt, "long")}
                </dd>
              </div>
            </dl>

            <Separator className="my-4" />

            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  toast({ title: "Password reset link sent to user email", variant: "success" })
                }}
              >
                <KeyRound className="mr-2 h-4 w-4" />
                Reset Password
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-destructive"
                onClick={() => {
                  toast({
                    title: user.isActive ? "User disabled" : "User enabled",
                    variant: "warning",
                  })
                }}
              >
                <Ban className="mr-2 h-4 w-4" />
                {user.isActive ? "Disable User" : "Enable User"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="activity">
        <TabsList>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Activity Log
          </TabsTrigger>
          <TabsTrigger value="sessions" className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            Active Sessions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="activity">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Action</TableHead>
                    <TableHead>Module</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>IP Address</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockActivityLog.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">{log.action}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{log.module}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(log.timestamp, "datetime")}
                      </TableCell>
                      <TableCell className="text-muted-foreground font-mono text-xs">
                        {log.ip}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Device</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockSessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Smartphone className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{session.device}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {session.ip}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {session.location}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(session.lastActive, "datetime")}
                      </TableCell>
                      <TableCell>
                        {session.isCurrent ? (
                          <Badge variant="success">Current</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </TableCell>
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
