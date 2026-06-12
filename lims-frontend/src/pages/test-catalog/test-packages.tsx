"use client"

import { useState, useMemo, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useForm, FormProvider, useFormContext } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { testPackageSchema, type TestPackageForm } from "@/lib/validations"
import {
  Plus, Edit2, Package, Percent, ArrowLeft, Save, X, Beaker,
  ChevronDown, ChevronRight, Tag
} from "lucide-react"
import type { TestPackage } from "@/types"
import { testPackages, tests } from "@/mock/data/tests"
import { generateId, formatCurrency } from "@/lib/utils"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/ui/empty-state"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import { useAppStore } from "@/store/appStore"
import { FormInput } from "@/components/forms/form-input"
import { FormTextarea } from "@/components/forms/form-textarea"
import { FormActions } from "@/components/forms/form-actions"
import { FormErrorSummary } from "@/components/forms/form-error-summary"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

function getTestName(id: string): string {
  return tests.find((t) => t.id === id)?.name ?? id
}

function TestCheckboxes() {
  const { watch, setValue } = useFormContext()
  const selected = watch("tests") || []

  const toggle = (testId: string) => {
    const updated = selected.includes(testId)
      ? selected.filter((id: string) => id !== testId)
      : [...selected, testId]
    setValue("tests", updated, { shouldDirty: true })
  }

  return (
    <ScrollArea className="h-40 rounded-md border p-2">
      <div className="space-y-1">
        {tests.map((test) => (
          <label
            key={test.id}
            className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm hover:bg-muted"
          >
            <input
              type="checkbox"
              checked={selected.includes(test.id)}
              onChange={() => toggle(test.id)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <span className="flex-1">{test.name}</span>
            <span className="text-xs text-muted-foreground">
              {formatCurrency(test.price)}
            </span>
          </label>
        ))}
      </div>
    </ScrollArea>
  )
}

export default function TestPackages() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { setBreadcrumbs } = useAppStore()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setBreadcrumbs([{ label: "Test Catalog", href: "/tests" }, { label: "Packages" }])
  }, [])
  const [expandedPackage, setExpandedPackage] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPackage, setEditingPackage] = useState<TestPackage | null>(null)

  const methods = useForm<TestPackageForm>({
    resolver: zodResolver(testPackageSchema),
    defaultValues: {
      name: "",
      code: "",
      description: "",
      price: "",
      discountedPrice: "",
      tests: [],
    },
  })

  const openCreateDialog = () => {
    setEditingPackage(null)
    methods.reset({ name: "", code: "", description: "", price: "", discountedPrice: "", tests: [] })
    setDialogOpen(true)
  }

  const openEditDialog = (pkg: TestPackage) => {
    setEditingPackage(pkg)
    methods.reset({
      name: pkg.name,
      code: pkg.code,
      description: pkg.description,
      price: String(pkg.price),
      discountedPrice: String(pkg.discountedPrice),
      tests: pkg.tests,
    })
    setDialogOpen(true)
  }

  const onSubmit = (data: TestPackageForm) => {
    toast({
      title: editingPackage ? "Package Updated" : "Package Created",
      description: `"${data.name}" has been ${editingPackage ? "updated" : "created"} successfully.`,
      variant: "success",
    })
    setDialogOpen(false)
  }

  const handleToggleStatus = (pkgId: string) => {
    const pkg = testPackages.find((p) => p.id === pkgId)
    if (pkg) {
      toast({
        title: pkg.isActive ? "Package Deactivated" : "Package Activated",
        description: `"${pkg.name}" is now ${pkg.isActive ? "inactive" : "active"}.`,
        variant: "success",
      })
    }
  }

  const savings = (pkg: TestPackage) => {
    if (pkg.discountedPrice >= pkg.price) return 0
    return Math.round(((pkg.price - pkg.discountedPrice) / pkg.price) * 100)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Test Packages"
        description="Create and manage test packages with discounted pricing"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/tests")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              All Tests
            </Button>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Create Package
            </Button>
          </div>
        }
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingPackage ? "Edit Package" : "Create Package"}
            </DialogTitle>
            <DialogDescription>
              {editingPackage
                ? "Update the package details and included tests."
                : "Create a new test package with discounted pricing."}
            </DialogDescription>
          </DialogHeader>
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)}>
              <div className="space-y-4">
                <FormErrorSummary />
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormInput name="name" label="Package Name" placeholder="e.g. Master Health Checkup" />
                  <FormInput name="code" label="Package Code" placeholder="e.g. MHC" onChange={(e) => methods.setValue("code", e.target.value.toUpperCase())} />
                </div>
                <FormTextarea name="description" label="Description" placeholder="Brief description of the package" />
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormInput name="price" label="Original Price (₹)" type="number" placeholder="3500" />
                  <FormInput name="discountedPrice" label="Discounted Price (₹)" type="number" placeholder="2499" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Included Tests</Label>
                  <TestCheckboxes />
                </div>
              </div>
              <DialogFooter className="mt-4">
                <DialogClose asChild>
                  <Button variant="outline" type="button">Cancel</Button>
                </DialogClose>
                <FormActions submitLabel={editingPackage ? "Update" : "Create"} showCancel={false} />
              </DialogFooter>
            </form>
          </FormProvider>
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {testPackages.map((pkg) => {
            const isExpanded = expandedPackage === pkg.id
            const savingPercent = savings(pkg)
            return (
              <Card key={pkg.id}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-primary/10 p-2 text-primary">
                        <Package className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{pkg.name}</h3>
                        <p className="font-mono text-xs text-muted-foreground">
                          {pkg.code}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={pkg.isActive}
                        onCheckedChange={() => handleToggleStatus(pkg.id)}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => openEditDialog(pkg)}
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  {savingPercent > 0 && (
                    <div className="mt-2">
                      <Badge variant="success" className="gap-1">
                        <Tag className="h-3 w-3" />
                        Save {savingPercent}%
                      </Badge>
                    </div>
                  )}

                  <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                    {pkg.description}
                  </p>

                  <div className="mt-3 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-muted-foreground line-through">
                        {formatCurrency(pkg.price)}
                      </span>
                      <span className="ml-2 text-lg font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(pkg.discountedPrice)}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {pkg.tests.length} tests
                    </span>
                  </div>

                  <div className="mt-3 border-t pt-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-full text-xs"
                      onClick={() =>
                        setExpandedPackage(isExpanded ? null : pkg.id)
                      }
                    >
                      {isExpanded ? (
                        <ChevronDown className="mr-1 h-3 w-3" />
                      ) : (
                        <ChevronRight className="mr-1 h-3 w-3" />
                      )}
                      {isExpanded ? "Hide Tests" : "Show Included Tests"}
                    </Button>
                    {isExpanded && (
                      <div className="mt-2 space-y-1">
                        {pkg.tests.map((testId) => (
                          <div
                            key={testId}
                            className="flex items-center gap-2 rounded bg-muted/50 px-2 py-1"
                          >
                            <Beaker className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs">{getTestName(testId)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
