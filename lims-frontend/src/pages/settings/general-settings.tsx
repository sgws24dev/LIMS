"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { generalSettingsSchema, type GeneralSettingsForm } from "@/lib/validations"
import {
  Building2, Upload, Globe, Clock, FileText, Bell,
  Shield, Save, Smartphone, Mail, MessageSquare,
  Eye, EyeOff, Sliders, Loader2,
} from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { useAppStore } from "@/store/appStore"
import { FormInput } from "@/components/forms/form-input"
import { FormTextarea } from "@/components/forms/form-textarea"
import { FormSelect } from "@/components/forms/form-select"
import { FormSwitch } from "@/components/forms/form-switch"
import { FormErrorSummary } from "@/components/forms/form-error-summary"

const timezoneOptions = [
  { value: "Asia/Kolkata (UTC+5:30)", label: "Asia/Kolkata (UTC+5:30)" },
  { value: "Asia/Dubai (UTC+4:00)", label: "Asia/Dubai (UTC+4:00)" },
  { value: "Asia/Singapore (UTC+8:00)", label: "Asia/Singapore (UTC+8:00)" },
  { value: "America/New_York (UTC-5:00)", label: "America/New_York (UTC-5:00)" },
  { value: "America/Chicago (UTC-6:00)", label: "America/Chicago (UTC-6:00)" },
  { value: "Europe/London (UTC+0:00)", label: "Europe/London (UTC+0:00)" },
  { value: "Australia/Sydney (UTC+11:00)", label: "Australia/Sydney (UTC+11:00)" },
]

const dateFormatOptions = [
  { value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
  { value: "MM/DD/YYYY", label: "MM/DD/YYYY" },
  { value: "YYYY-MM-DD", label: "YYYY-MM-DD" },
  { value: "DD-MMM-YYYY", label: "DD-MMM-YYYY" },
]

const languageOptions = [
  { value: "English", label: "English" },
  { value: "Hindi", label: "Hindi" },
  { value: "Spanish", label: "Spanish" },
  { value: "Arabic", label: "Arabic" },
  { value: "French", label: "French" },
]

export default function GeneralSettings() {
  const { toast } = useToast()
  const { setBreadcrumbs } = useAppStore()

  useEffect(() => {
    setBreadcrumbs([{ label: "Settings" }])
  }, [])

  const methods = useForm<GeneralSettingsForm>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      labName: "City Pathology Lab",
      registrationNo: "NABL-ML-2025-0042",
      address: "42, Health Care Complex, Sector 12\nMumbai, Maharashtra 400001",
      phone: "+91 22 4567 8900",
      email: "contact@citypathologylab.com",
      website: "www.citypathologylab.com",
      timezone: "Asia/Kolkata (UTC+5:30)",
      dateFormat: "DD/MM/YYYY",
      defaultLanguage: "English",
      footerText: "This report is electronically generated and does not require a signature.",
      signature: "Dr. Rajesh Mehta, MD - Lab Director",
      emailNotifications: true,
      smsNotifications: true,
      whatsappNotifications: false,
      sessionTimeout: 30,
      minPasswordLength: 8,
      requireSpecialChars: true,
      twoFactorEnabled: false,
    },
  })

  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)

  const onSubmit = useCallback(async (data: GeneralSettingsForm) => {
    setSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 1200))
    setSaving(false)
    toast({ title: "Settings saved", description: "Your changes have been applied successfully.", variant: "success" })
  }, [toast])

  const handleLogoUpload = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleLogoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      toast({ title: "Logo selected", description: `${file.name} (${(file.size / 1024).toFixed(1)} KB)`, variant: "default" })
    }
  }, [toast])

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <div className="space-y-6">
          <PageHeader
            title="General Settings"
            description="Configure your laboratory information and system preferences"
            actions={
              <Button type="submit" disabled={saving}>
                {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : <><Save className="mr-2 h-4 w-4" /> Save Settings</>}
              </Button>
            }
          />

          <FormErrorSummary />

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-base">Laboratory Information</CardTitle>
              </div>
              <CardDescription>Basic information about your laboratory facility</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormInput name="labName" label="Laboratory Name" />
                <FormInput name="registrationNo" label="Registration Number" />
                <FormTextarea name="address" label="Address" className="sm:col-span-2" />
                <FormInput name="phone" label="Phone" />
                <FormInput name="email" label="Email" type="email" />
                <FormInput name="website" label="Website" />
                <div className="space-y-2">
                  <Label>Logo</Label>
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-lg border bg-muted/50">
                      <Building2 className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <Button variant="outline" size="sm" type="button" onClick={handleLogoUpload}>
                      <Upload className="mr-2 h-4 w-4" />
                      {logoFile ? logoFile.name : "Upload Logo"}
                    </Button>
                    <input type="file" ref={fileInputRef} hidden accept="image/png,image/jpg,image/svg+xml" onChange={handleLogoChange} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-base">Regional Settings</CardTitle>
              </div>
              <CardDescription>Timezone and date format preferences</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <FormSelect name="timezone" label="Timezone" options={timezoneOptions} />
              <FormSelect name="dateFormat" label="Date Format" options={dateFormatOptions} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-base">Report Defaults</CardTitle>
              </div>
              <CardDescription>Default settings for generated reports</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormSelect name="defaultLanguage" label="Default Report Language" options={languageOptions} />
                <FormInput name="footerText" label="Default Footer Text" />
                <FormInput name="signature" label="Default Signature" className="sm:col-span-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-base">Notification Defaults</CardTitle>
              </div>
              <CardDescription>Configure default notification channels</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormSwitch name="emailNotifications" label="Email Notifications" />
              <FormSwitch name="smsNotifications" label="SMS Notifications" />
              <FormSwitch name="whatsappNotifications" label="WhatsApp Notifications" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-base">Security Settings</CardTitle>
              </div>
              <CardDescription>Session and password policy configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Session Timeout (minutes)</Label>
                  <span className="text-sm font-medium">{methods.watch("sessionTimeout")} min</span>
                </div>
                <div className="flex items-center gap-4">
                  <Sliders className="h-4 w-4 text-muted-foreground" />
                  <input
                    type="range"
                    min={5}
                    max={120}
                    step={5}
                    value={methods.watch("sessionTimeout")}
                    onChange={(e) => methods.setValue("sessionTimeout", Number(e.target.value), { shouldDirty: true })}
                    className="h-2 w-full cursor-pointer appearance-none rounded-full bg-primary/20 accent-primary"
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>5 min</span>
                  <span>120 min</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="text-sm font-medium">Minimum Password Length</p>
                    <p className="text-xs text-muted-foreground">Current requirement: {methods.watch("minPasswordLength")} characters</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" type="button" onClick={() => methods.setValue("minPasswordLength", Math.max(6, methods.watch("minPasswordLength") - 1), { shouldDirty: true })}>-</Button>
                    <span className="w-8 text-center text-sm font-medium">{methods.watch("minPasswordLength")}</span>
                    <Button variant="outline" size="sm" type="button" onClick={() => methods.setValue("minPasswordLength", Math.min(32, methods.watch("minPasswordLength") + 1), { shouldDirty: true })}>+</Button>
                  </div>
                </div>
                <FormSwitch name="requireSpecialChars" label="Require Special Characters" />
                <FormSwitch name="twoFactorEnabled" label="Two-Factor Authentication" />
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </FormProvider>
  )
}
