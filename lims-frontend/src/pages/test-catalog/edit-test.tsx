"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Save } from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { tests, testCategories } from "@/mock/data/tests"
import { useToast } from "@/hooks/use-toast"
import { useAppStore } from "@/store/appStore"

const departmentOptions = [
  "Biochemistry", "Hematology", "Microbiology", "Pathology", "Immunology", "Serology",
]

const sampleTypeOptions = [
  "Blood", "Serum", "Plasma", "Urine", "Stool", "Swab", "CSF", "Tissue",
]

export default function EditTestPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { setBreadcrumbs } = useAppStore()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [notFound, setNotFound] = useState(false)

  const [form, setForm] = useState({
    name: "",
    code: "",
    category: "",
    department: "",
    price: "",
    description: "",
    preparation: "",
    sampleType: "",
    turnaroundTime: "",
    isActive: true,
  })

  useEffect(() => {
    setBreadcrumbs([{ label: "Test Catalog", href: "/tests" }, { label: "Edit Test" }])
  }, [])

  useEffect(() => {
    const test = tests.find((t) => t.id === id)
    if (!test) {
      setNotFound(true)
      setLoading(false)
      return
    }
    setForm({
      name: test.name,
      code: test.code,
      category: test.category,
      department: test.department,
      price: String(test.price),
      description: "",
      preparation: test.preparation ?? "",
      sampleType: "",
      turnaroundTime: test.turnaroundTime,
      isActive: test.isActive,
    })
    setLoading(false)
  }, [id])

  const update = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const test = tests.find((t) => t.id === id)
      if (test) {
        test.name = form.name.trim()
        test.code = form.code.trim()
        test.category = form.category || "General"
        test.department = form.department || "General"
        test.price = Number(form.price) || 0
        test.turnaroundTime = form.turnaroundTime || "24 hours"
        test.isActive = form.isActive
        test.preparation = form.preparation.trim() || undefined
      }
      toast({ title: "Test updated successfully", variant: "success" })
      navigate("/tests")
    } catch {
      toast({ title: "Failed to update test", variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardContent className="p-6 space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="space-y-6">
        <PageHeader title="Edit Test" description="Update a laboratory test" />
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
        title="Edit Test"
        description="Update a laboratory test"
        actions={
          <Button variant="outline" onClick={() => navigate("/tests")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        }
      />

      <form onSubmit={handleSubmit}>
        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Test Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter test name"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Test Code *</Label>
                <Input
                  id="code"
                  placeholder="Enter test code"
                  value={form.code}
                  onChange={(e) => update("code", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={form.category} onValueChange={(v) => update("category", v)}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {testCategories.map((c) => (
                      <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select value={form.department} onValueChange={(v) => update("department", v)}>
                  <SelectTrigger id="department">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departmentOptions.map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="sampleType">Sample Type</Label>
                <Select value={form.sampleType} onValueChange={(v) => update("sampleType", v)}>
                  <SelectTrigger id="sampleType">
                    <SelectValue placeholder="Select sample type" />
                  </SelectTrigger>
                  <SelectContent>
                    {sampleTypeOptions.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price (₹)</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  placeholder="Enter price"
                  value={form.price}
                  onChange={(e) => update("price", e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="turnaroundTime">Turnaround Time</Label>
                <Input
                  id="turnaroundTime"
                  placeholder="e.g. 24 hours"
                  value={form.turnaroundTime}
                  onChange={(e) => update("turnaroundTime", e.target.value)}
                />
              </div>
              <div className="flex items-end gap-4">
                <div className="space-y-2 flex-1">
                  <Label>Active Status</Label>
                  <div className="flex items-center gap-3 h-9">
                    <Switch
                      checked={form.isActive}
                      onCheckedChange={(v) => update("isActive", v)}
                    />
                    <span className="text-sm text-muted-foreground">
                      {form.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter test description"
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="preparation">Preparation Instructions</Label>
              <Textarea
                id="preparation"
                placeholder="Enter preparation instructions (e.g. Fasting required)"
                value={form.preparation}
                onChange={(e) => update("preparation", e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex items-center gap-3">
          <Button type="submit" disabled={submitting}>
            <Save className="mr-2 h-4 w-4" />
            {submitting ? "Saving..." : "Save Changes"}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate("/tests")}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
