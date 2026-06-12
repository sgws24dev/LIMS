"use client"

import { useState, useEffect, useMemo } from "react"
import { useNavigate } from "react-router"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { reportBrandingSchema, type ReportBrandingForm } from "@/lib/validations"
import {
  Palette,
  Plus,
  Save,
  Image,
  Type,
  AlignLeft,
  Check,
  Trash2,
  Eye,
  Building2,
  FileText,
  QrCode,
} from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { useAppStore } from "@/store/appStore"
import { useToast } from "@/hooks/use-toast"
import { cn, formatDate } from "@/lib/utils"
import { FormInput } from "@/components/forms/form-input"
import { FormTextarea } from "@/components/forms/form-textarea"
import { FormSelect } from "@/components/forms/form-select"
import { FormSwitch } from "@/components/forms/form-switch"
import { FormErrorSummary } from "@/components/forms/form-error-summary"
import { FormActions } from "@/components/forms/form-actions"
import type { ReportTemplate } from "@/types"
import { reportTemplates as mockTemplates } from "@/mock/data/report-templates"
import { updateReportTemplate } from "@/mock/services/index"

const fontOptions = [
  { value: "Arial, sans-serif", label: "Arial" },
  { value: "Helvetica, sans-serif", label: "Helvetica" },
  { value: "Georgia, serif", label: "Georgia" },
  { value: "Times New Roman, serif", label: "Times New Roman" },
  { value: "Inter, sans-serif", label: "Inter" },
  { value: "Segoe UI, sans-serif", label: "Segoe UI" },
]

export default function ReportBrandingPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const setBreadcrumbs = useAppStore((s) => s.setBreadcrumbs)

  const [loading, setLoading] = useState(true)
  const [templates, setTemplates] = useState<ReportTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null)
  const [editDialog, setEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [templateToDelete, setTemplateToDelete] = useState<ReportTemplate | null>(null)

  const methods = useForm<ReportBrandingForm>({
    resolver: zodResolver(reportBrandingSchema),
    defaultValues: {
      name: "",
      description: "",
      logoUrl: "",
      headerColor: "",
      fontFamily: "",
      showQR: false,
      showPatientSummary: false,
      showAIInterpretation: false,
      footer: "",
      isDefault: false,
    },
  })

  useEffect(() => {
    setBreadcrumbs([
      { label: "Home", href: "/dashboard" },
      { label: "Reports" },
      { label: "Branding" },
    ])
    const timer = setTimeout(() => {
      setTemplates(mockTemplates)
      const defaultTpl = mockTemplates.find((t) => t.isDefault) || mockTemplates[0]
      setSelectedTemplate(defaultTpl)
      setLoading(false)
    }, 600)
    return () => clearTimeout(timer)
  }, [setBreadcrumbs])

  const handleEdit = (template: ReportTemplate) => {
    methods.reset({
      name: template.name,
      description: template.description || "",
      logoUrl: template.logoUrl || "",
      headerColor: template.headerColor || "",
      fontFamily: template.fontFamily || "",
      showQR: template.showQR || false,
      showPatientSummary: template.showPatientSummary || false,
      showAIInterpretation: template.showAIInterpretation || false,
      footer: template.footer || "",
      isDefault: template.isDefault || false,
    })
    setEditDialog(true)
  }

  const handleCreate = () => {
    methods.reset({
      name: "",
      description: "",
      logoUrl: "",
      headerColor: "#1a56db",
      fontFamily: "Arial, sans-serif",
      showQR: true,
      showPatientSummary: true,
      showAIInterpretation: false,
      footer: "",
      isDefault: false,
    })
    setEditDialog(true)
  }

  const onSubmit = async (data: ReportBrandingForm) => {
    try {
      const template = templates.find((t) => t.id === selectedTemplate?.id)
      if (template) {
        await updateReportTemplate(template.id, data)
        setTemplates((prev) => prev.map((t) => (t.id === template.id ? { ...t, ...data } as ReportTemplate : t)))
        if (selectedTemplate?.id === template.id) setSelectedTemplate({ ...selectedTemplate, ...data } as ReportTemplate)
      }
      toast({ title: "Template saved", description: `"${data.name}" has been saved.`, variant: "success" })
      setEditDialog(false)
    } catch {
      toast({ title: "Error", description: "Failed to save template.", variant: "destructive" })
    }
  }

  const handleSetDefault = async (template: ReportTemplate) => {
    try {
      await updateReportTemplate(template.id, { isDefault: true })
      setTemplates((prev) => prev.map((t) => ({ ...t, isDefault: t.id === template.id })))
      toast({ title: "Default template set", description: `"${template.name}" is now the default.`, variant: "success" })
    } catch {
      toast({ title: "Error", description: "Failed to set default template.", variant: "destructive" })
    }
  }

  const handleDelete = () => {
    if (!templateToDelete) return
    setTemplates((prev) => prev.filter((t) => t.id !== templateToDelete.id))
    if (selectedTemplate?.id === templateToDelete.id) {
      setSelectedTemplate(templates.length > 1 ? templates.find((t) => t.id !== templateToDelete.id) ?? null : null)
    }
    toast({ title: "Template deleted", description: `"${templateToDelete.name}" has been deleted.`, variant: "warning" })
    setShowDeleteDialog(false)
    setTemplateToDelete(null)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Report Branding" description="Configure report branding and templates" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-[400px] rounded-xl" />
          <Skeleton className="h-[400px] rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Report Branding"
        description="Configure report branding and templates"
        actions={
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />New Template
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Templates</CardTitle></CardHeader>
          <CardContent>
            {templates.length === 0 ? (
              <EmptyState icon={<Palette className="h-12 w-12" />} title="No templates" description="Create your first branding template." />
            ) : (
              <div className="space-y-3">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className={cn(
                      "rounded-lg border p-4 transition-colors cursor-pointer hover:bg-accent/50",
                      selectedTemplate?.id === template.id && "border-primary/50 bg-primary/[0.03]"
                    )}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{template.name}</span>
                          {template.isDefault && <Badge variant="success">Default</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">{template.description}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Palette className="h-3 w-3" />{template.headerColor}</span>
                          <span className="flex items-center gap-1"><Type className="h-3 w-3" />{template.fontFamily.split(",")[0]}</span>
                          {template.showQR && <span className="flex items-center gap-1"><QrCode className="h-3 w-3" />QR</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon-sm" onClick={(e) => { e.stopPropagation(); handleEdit(template) }}>
                          <Save className="h-3.5 w-3.5" />
                        </Button>
                        {!template.isDefault && (
                          <Button variant="ghost" size="icon-sm" onClick={(e) => { e.stopPropagation(); handleSetDefault(template) }} title="Set as default">
                            <Check className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon-sm" className="text-destructive" onClick={(e) => { e.stopPropagation(); setTemplateToDelete(template); setShowDeleteDialog(true) }} title="Delete template">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Live Preview</CardTitle></CardHeader>
          <CardContent>
            <div className="rounded-xl border bg-white overflow-hidden text-xs">
              <div className="p-4 text-white" style={{ backgroundColor: selectedTemplate?.headerColor || "#1a56db" }}>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">LifSys Diagnostics</p>
                    <p className="text-[10px] text-white/80">NABL & ISO 15189 Accredited</p>
                  </div>
                </div>
              </div>
              <div className="p-4 space-y-3" style={{ fontFamily: selectedTemplate?.fontFamily || "Arial, sans-serif" }}>
                <div className="grid grid-cols-2 gap-3">
                  <div><p className="text-[10px] text-muted-foreground">Patient</p><p className="text-xs font-medium">Rajesh Sharma</p></div>
                  <div><p className="text-[10px] text-muted-foreground">Report ID</p><p className="text-xs font-mono">RES001</p></div>
                </div>
                <div className="rounded border overflow-hidden">
                  <table className="w-full">
                    <thead><tr className="bg-muted/50"><th className="px-3 py-1.5 text-left text-[10px]">Test</th><th className="px-3 py-1.5 text-left text-[10px]">Result</th><th className="px-3 py-1.5 text-left text-[10px]">Range</th></tr></thead>
                    <tbody className="divide-y">
                      <tr><td className="px-3 py-1.5 text-[10px]">Hemoglobin</td><td className="px-3 py-1.5 text-[10px] font-mono">14.2</td><td className="px-3 py-1.5 text-[10px] text-muted-foreground">13-17</td></tr>
                      <tr><td className="px-3 py-1.5 text-[10px]">WBC</td><td className="px-3 py-1.5 text-[10px] font-mono">7,200</td><td className="px-3 py-1.5 text-[10px] text-muted-foreground">4,000-11,000</td></tr>
                    </tbody>
                  </table>
                </div>
                {selectedTemplate?.showQR && (
                  <div className="flex items-center justify-center">
                    <QrCode className="h-8 w-8 text-muted-foreground/40" />
                  </div>
                )}
                <p className="text-[10px] text-muted-foreground text-center border-t pt-3">{selectedTemplate?.footer || "Default footer text"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>{selectedTemplate ? "Edit Template" : "Create Template"}</DialogTitle>
            <DialogDescription>Configure report branding settings.</DialogDescription>
          </DialogHeader>
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)}>
              <div className="space-y-4">
                <FormErrorSummary />
                <div className="grid grid-cols-2 gap-4">
                  <FormInput name="name" label="Template Name" placeholder="e.g. Default Report" />
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Header Color</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={methods.watch("headerColor") || "#1a56db"}
                        onChange={(e) => methods.setValue("headerColor", e.target.value, { shouldDirty: true })}
                        className="h-9 w-12 rounded border border-input bg-background p-0.5 cursor-pointer"
                      />
                      <FormInput name="headerColor" placeholder="#1a56db" className="flex-1" />
                    </div>
                  </div>
                </div>
                <FormInput name="logoUrl" label="Logo URL" placeholder="/logos/lifsys-blue.png" />
                <FormSelect name="fontFamily" label="Font Family" placeholder="Select font" options={fontOptions} />
                <FormTextarea name="footer" label="Footer Text" />
                <div className="space-y-3">
                  <FormSwitch name="showQR" label="Show QR Code" />
                  <FormSwitch name="showPatientSummary" label="Patient Summary" />
                  <FormSwitch name="showAIInterpretation" label="AI Interpretation" />
                </div>
              </div>
              <DialogFooter className="mt-4">
                <Button type="button" variant="outline" onClick={() => setEditDialog(false)}>Cancel</Button>
                <FormActions submitLabel="Save Template" showCancel={false} />
              </DialogFooter>
            </form>
          </FormProvider>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Template"
        description={`Are you sure you want to delete "${templateToDelete?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  )
}
