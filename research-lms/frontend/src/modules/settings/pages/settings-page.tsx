import { useEffect } from "react"
import { useUIStore } from "@/store/uiStore"
import { PageContainer } from "@/shared/shared/page-container"

export default function SettingsPage() {
  const { setBreadcrumbs } = useUIStore()

  useEffect(() => {
    setBreadcrumbs([{ label: "System" }, { label: "Settings" }])
  }, [setBreadcrumbs])

  return (
    <PageContainer title="Settings" description="Configure platform settings">
      <div className="flex items-center justify-center rounded-xl border border-dashed p-12">
        <p className="text-sm text-muted-foreground">Settings page coming soon.</p>
      </div>
    </PageContainer>
  )
}
