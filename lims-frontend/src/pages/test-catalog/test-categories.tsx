"use client"

import { useState, useMemo, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { testCategorySchema, type TestCategoryForm } from "@/lib/validations"
import {
  Plus, Edit2, FolderOpen, Beaker, ArrowLeft, Save, X,
  FlaskConical
} from "lucide-react"
import type { TestCategory, Test } from "@/types"
import { testCategories, tests } from "@/mock/data/tests"
import { generateId, formatCurrency } from "@/lib/utils"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/ui/empty-state"
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { useAppStore } from "@/store/appStore"

export default function TestCategories() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { setBreadcrumbs } = useAppStore()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setBreadcrumbs([{ label: "Test Catalog", href: "/tests" }, { label: "Categories" }])
  }, [])
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<TestCategory | null>(null)

  const methods = useForm<TestCategoryForm>({
    resolver: zodResolver(testCategorySchema),
    defaultValues: { name: "", description: "" },
  })

  const openCreateDialog = () => {
    setEditingCategory(null)
    methods.reset({ name: "", description: "" })
    setDialogOpen(true)
  }

  const openEditDialog = (cat: TestCategory) => {
    setEditingCategory(cat)
    methods.reset({ name: cat.name, description: cat.description })
    setDialogOpen(true)
  }

  const onSubmit = (data: TestCategoryForm) => {
    toast({
      title: editingCategory ? "Category Updated" : "Category Created",
      description: `"${data.name}" has been ${editingCategory ? "updated" : "created"} successfully.`,
      variant: "success",
    })
    setDialogOpen(false)
  }

  const getTestsForCategory = (categoryName: string): Test[] => {
    return tests.filter((t) => t.category === categoryName)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Test Categories"
        description="Manage test categories and view tests within each"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/tests")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              All Tests
            </Button>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Create Category
            </Button>
          </div>
        }
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Edit Category" : "Create Category"}</DialogTitle>
            <DialogDescription>
              {editingCategory
                ? "Update the test category details."
                : "Add a new test category to organize tests."}
            </DialogDescription>
          </DialogHeader>
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)}>
              <div className="space-y-4">
                <FormErrorSummary />
                <FormInput name="name" label="Category Name" placeholder="e.g. Biochemistry" />
                <FormTextarea name="description" label="Description" placeholder="Brief description of this category" />
              </div>
              <DialogFooter className="mt-4">
                <DialogClose asChild>
                  <Button variant="outline" type="button">Cancel</Button>
                </DialogClose>
                <FormActions submitLabel={editingCategory ? "Update" : "Create"} showCancel={false} />
              </DialogFooter>
            </form>
          </FormProvider>
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {testCategories.map((cat) => {
            const catTests = getTestsForCategory(cat.name)
            const isExpanded = expandedCategory === cat.id
            return (
              <Card key={cat.id}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-primary/10 p-2 text-primary">
                        <FolderOpen className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{cat.name}</h3>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {cat.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={cat.isActive ? "success" : "secondary"}>
                        {cat.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => openEditDialog(cat)}
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t pt-3">
                    <span className="text-sm text-muted-foreground">
                      {catTests.length} tests
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() =>
                        setExpandedCategory(isExpanded ? null : cat.id)
                      }
                    >
                      <Beaker className="mr-1 h-3 w-3" />
                      {isExpanded ? "Hide Tests" : "View Tests"}
                    </Button>
                  </div>
                  {isExpanded && (
                    <div className="mt-3 border-t pt-3">
                      {catTests.length === 0 ? (
                        <p className="text-xs text-muted-foreground">
                          No tests in this category.
                        </p>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="text-xs">Code</TableHead>
                              <TableHead className="text-xs">Test</TableHead>
                              <TableHead className="text-right text-xs">Price</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {catTests.map((t) => (
                              <TableRow key={t.id}>
                                <TableCell className="font-mono text-xs">{t.code}</TableCell>
                                <TableCell className="text-xs">{t.name}</TableCell>
                                <TableCell className="text-right text-xs">
                                  {formatCurrency(t.price)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
