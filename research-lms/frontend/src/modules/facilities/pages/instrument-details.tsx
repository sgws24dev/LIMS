"use client"

import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useUIStore } from "@/store/uiStore"
import { PageContainer } from "@/shared/shared/page-container"
import { Button } from "@/shared/ui/button"
import { Badge } from "@/shared/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import { getAssetById, type AssetDetail } from "@/services/api/facilities"
import { AssetStatusBadge } from "../components/asset-status-badge"
import TelemetryWidget from "../components/telemetry-widget"
import QrLabelDialog from "./qr-label-dialog"
import { ArrowLeft, Pencil, Wifi, WifiOff, Calendar, Network, Cpu, Tag, Loader2, ChartLine, QrCode } from "lucide-react"

export default function InstrumentDetailsPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { setBreadcrumbs } = useUIStore()
  const [asset, setAsset] = useState<AssetDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [qrOpen, setQrOpen] = useState(false)

  useEffect(() => {
    setBreadcrumbs([{ label: "Facilities" }, { label: "Instruments", href: "/facilities/instruments" }, { label: "Instrument Details" }])
  }, [setBreadcrumbs])

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getAssetById(id)
      .then(setAsset)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <PageContainer title="Instrument Details" description="Loading...">
        <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      </PageContainer>
    )
  }

  if (notFound || !asset) {
    return (
      <PageContainer title="Instrument Details" description="Instrument not found">
        <p className="text-sm text-muted-foreground">The requested instrument could not be found.</p>
      </PageContainer>
    )
  }

  const getCalibrationDueInfo = () => {
    if (!asset.nextCalibrationDate) return null
    const d = new Date(asset.nextCalibrationDate)
    const now = new Date()
    const diffDays = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays < 0) return { label: `Overdue by ${Math.abs(diffDays)} days`, variant: "destructive" as const }
    if (diffDays <= 30) return { label: `Due in ${diffDays} days`, variant: "warning" as const }
    return { label: `${diffDays} days remaining`, variant: "outline" as const }
  }

  const calInfo = getCalibrationDueInfo()

  return (
    <PageContainer
      title={asset.name}
      description={`Identifier: ${asset.identifier}`}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate("/facilities/instruments")}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate(`/facilities/instruments/${asset.id}/config`)}>
            <Pencil className="mr-1 h-4 w-4" /> Edit Config
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate(`/facilities/assets/${asset.id}/depreciation`)}>
            <ChartLine className="mr-1 h-4 w-4" /> Depreciation
          </Button>
          <Button variant="outline" size="sm" onClick={() => setQrOpen(true)}>
            <QrCode className="mr-1 h-4 w-4" /> QR
          </Button>
          <Button size="sm" onClick={() => navigate(`/facilities/assets/${asset.id}/edit`)}>
            <Pencil className="mr-1 h-4 w-4" /> Edit
          </Button>
        </div>
      }
    >
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left column - Info */}
        <div className="space-y-6 md:col-span-2">
          {/* Instrument Config */}
          <Card>
            <CardHeader>
              <CardTitle>Instrument Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">IP Address</p>
                  <p className="text-sm font-medium">{asset.ipAddress || "—"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Port</p>
                  <p className="text-sm font-medium">{asset.port ?? "—"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Protocol</p>
                  <p className="text-sm font-medium">{asset.connectionProtocol || "—"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Firmware</p>
                  <p className="text-sm font-medium">{asset.firmware || "—"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">IoT Enabled</p>
                  <p className="text-sm font-medium">{asset.iotEnabled ? "Yes" : "No"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <AssetStatusBadge status={asset.status} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* General Info */}
          <Card>
            <CardHeader>
              <CardTitle>General Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Category</p>
                  <p className="text-sm font-medium">{asset.category}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Manufacturer</p>
                  <p className="text-sm font-medium">{asset.manufacturer || "—"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Model</p>
                  <p className="text-sm font-medium">{asset.model || "—"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="text-sm font-medium">{asset.location || "—"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Facility</p>
                  <p className="text-sm font-medium">{asset.facilityName || "—"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Acquired</p>
                  <p className="text-sm font-medium">{asset.acquisitionDate || "—"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <TelemetryWidget instrumentId={asset.id} isIotEnabled={asset.iotEnabled} />
        </div>

        {/* Right column - Sidebar */}
        <div className="space-y-6">
          {/* Calibration Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Calibration Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Last Calibration</p>
                <p className="text-sm font-medium">{asset.lastCalibrationDate || "—"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Next Due</p>
                <p className="text-sm font-medium">{asset.nextCalibrationDate || "—"}</p>
              </div>
              {calInfo && <Badge variant={calInfo.variant}>{calInfo.label}</Badge>}
              <Button variant="outline" size="sm" className="w-full" onClick={() => navigate("/facilities/calibration")}>
                View Calibration Records
              </Button>
            </CardContent>
          </Card>

          {/* Connection Status */}
          <Card>
            <CardHeader>
              <CardTitle>Connection</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {asset.iotEnabled ? <Wifi className="h-5 w-5 text-green-500" /> : <WifiOff className="h-5 w-5 text-gray-400" />}
                <span className="text-sm font-medium">{asset.iotEnabled ? "Online" : "Disconnected"}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {asset.iotEnabled ? "IoT telemetry is active" : "IoT capabilities are disabled"}
              </p>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full" onClick={() => navigate(`/facilities/calibration?instrumentId=${asset.id}`)}>
                Log Calibration
              </Button>
              <Button variant="outline" size="sm" className="w-full" onClick={() => navigate(`/facilities/assets/${asset.id}/depreciation`)}>
                View Depreciation
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      <QrLabelDialog
        assetId={asset.id}
        assetName={asset.name}
        identifier={asset.identifier}
        open={qrOpen}
        onClose={() => setQrOpen(false)}
      />
    </PageContainer>
  )
}
