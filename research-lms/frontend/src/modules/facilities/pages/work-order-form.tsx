"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useForm, FormProvider, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/shared/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/shared/ui/dialog"
import { FormInput } from "@/shared/forms/form-input"
import { FormSelect } from "@/shared/forms/form-select"
import { FormActions } from "@/shared/forms/form-actions"
import { Loader2 } from "lucide-react"
import { createMaintenance, createWorkOrder, type CreateMaintenanceRequest, type CreateWorkOrderRequest } from "@/services/api/facilities"

const workOrderSchema = z.object({
  assetId: z.string().min(1, "Asset is required"),
  type: z.string().min(1, "Maintenance type is required"),
  scheduledDate: z.string().min(1, "Scheduled date is required"),
  description: z.string().optional(),
  technicianName: z.string().optional(),
  cost: z.coerce.number().min(0).nullable().optional(),
  title: z.string().min(1, "Title is required").max(300),
  priority: z.string().min(1, "Priority is required"),
  assigneeName: z.string().optional(),
  dueDate: z.string().optional(),
})

type WorkOrderForm = z.infer<typeof workOrderSchema>

const workOrderResolver = zodResolver(workOrderSchema) as unknown as Resolver<WorkOrderForm>

const maintenanceTypeOptions = [
  { value: "Preventive", label: "Preventive" },
  { value: "Corrective", label: "Corrective" },
  { value: "Inspection", label: "Inspection" },
  { value: "Emergency", label: "Emergency" },
]

const priorityOptions = [
  { value: "Low", label: "Low" },
  { value: "Medium", label: "Medium" },
  { value: "High", label: "High" },
  { value: "Critical", label: "Critical" },
]

interface WorkOrderFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function WorkOrderFormDialog({ open, onOpenChange, onSuccess }: WorkOrderFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Schedule Maintenance</DialogTitle>
          <DialogDescription>Create a maintenance record and optional work order</DialogDescription>
        </DialogHeader>
        <WorkOrderFormContent onSuccess={() => { onSuccess(); onOpenChange(false) }} embedded />
      </DialogContent>
    </Dialog>
  )
}

interface WorkOrderFormContentProps {
  onSuccess?: () => void
  embedded?: boolean
}

function WorkOrderFormContent({ onSuccess, embedded }: WorkOrderFormContentProps) {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)

  const form = useForm<WorkOrderForm>({
    resolver: workOrderResolver,
    defaultValues: {
      assetId: "",
      type: "Preventive",
      scheduledDate: "",
      description: "",
      technicianName: "",
      cost: null,
      title: "",
      priority: "Medium",
      assigneeName: "",
      dueDate: "",
    },
  })

  const onSubmit = async (values: WorkOrderForm) => {
    setSaving(true)
    try {
      const maintReq: CreateMaintenanceRequest = {
        assetId: values.assetId,
        type: values.type,
        scheduledDate: values.scheduledDate,
        description: values.description,
        technicianName: values.technicianName,
        cost: values.cost ?? undefined,
      }
      const { id: maintenanceId } = await createMaintenance(maintReq)

      if (values.title) {
        await createWorkOrder(maintenanceId, {
          title: values.title,
          priority: values.priority,
          assigneeName: values.assigneeName,
          dueDate: values.dueDate,
        })
      }

      onSuccess?.()
      if (!embedded) navigate("/facilities/maintenance")
    } catch {
      // silent
    } finally {
      setSaving(false)
    }
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {!embedded && (
          <Card>
            <CardHeader><CardTitle>Schedule Maintenance</CardTitle></CardHeader>
            <CardContent>
              <FormContentFields />
            </CardContent>
          </Card>
        )}
        {embedded && <FormContentFields />}

        <FormActions
          submitLabel="Schedule Maintenance"
          cancelLabel="Cancel"
          loading={saving}
          onCancel={() => embedded ? onSuccess?.() : navigate(-1)}
        />
      </form>
    </FormProvider>
  )
}

function FormContentFields() {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium">Maintenance Details</h4>
      <div className="grid grid-cols-2 gap-4">
        <FormInput name="assetId" label="Asset ID" placeholder="Enter asset ID" />
        <FormSelect name="type" label="Maintenance Type" options={maintenanceTypeOptions} />
        <FormInput name="scheduledDate" label="Scheduled Date" type="date" />
        <FormInput name="technicianName" label="Technician Name" />
        <FormInput name="cost" label="Estimated Cost" type="number" placeholder="0" />
      </div>
      <FormInput name="description" label="Description" />

      <hr className="border-border/50" />
      <h4 className="text-sm font-medium">Work Order</h4>
      <div className="grid grid-cols-2 gap-4">
        <FormInput name="title" label="Work Order Title" placeholder="e.g., Quarterly calibration" />
        <FormSelect name="priority" label="Priority" options={priorityOptions} />
        <FormInput name="assigneeName" label="Assignee Name" />
        <FormInput name="dueDate" label="Due Date" type="date" />
      </div>
    </div>
  )
}

export default WorkOrderFormContent
