"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Edit2 } from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { tests } from "@/mock/data/tests"
import { formatCurrency } from "@/lib/utils"
import { useAppStore } from "@/store/appStore"

export default function TestDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { setBreadcrumbs } = useAppStore()
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const test = tests.find((t) => t.id === id)

  useEffect(() => {
    if (!test) {
      setNotFound(true)
      setLoading(false)
      return
    }
    setLoading(false)
  }, [id])

  useEffect(() => {
    setBreadcrumbs([{ label: "Test Catalog", href: "/tests" }, { label: "Test Details" }])
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-6 sm:grid-cols-2">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (notFound || !test) {
    return (
      <div className="space-y-6">
        <PageHeader title="Test Details" description="View test information" />
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            Test not found
          </CardContent>
        </Card>
        <Button variant="outline" onClick={() => navigate("/tests")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Tests
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={test.name}
        description={`Code: ${test.code}`}
        actions={
          <div className="flex gap-2">
            <Button onClick={() => navigate(`/tests/${test.id}/edit`)}>
              <Edit2 className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button variant="outline" onClick={() => navigate("/tests")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Tests
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Test Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Name</span>
              <span className="text-sm font-medium">{test.name}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Code</span>
              <span className="text-sm font-medium font-mono">{test.code}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Category</span>
              <Badge variant="outline">{test.category}</Badge>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Department</span>
              <span className="text-sm font-medium">{test.department}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Sample Type</span>
              <span className="text-sm font-medium">--</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Turnaround Time</span>
              <Badge variant="outline" className="text-xs">{test.turnaroundTime}</Badge>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge variant={test.isActive ? "success" : "secondary"}>
                {test.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pricing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Price</span>
              <span className="text-2xl font-semibold">{formatCurrency(test.price)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Full Description</p>
            <p className="text-sm">
              {test.name} (Code: {test.code}) is a {test.category?.toLowerCase()} test processed in the {test.department?.toLowerCase()} department. Results are typically available within {test.turnaroundTime?.toLowerCase()}.
            </p>
          </div>
          {test.preparation && (
            <>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-1">Preparation Instructions</p>
                <p className="text-sm">{test.preparation}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
