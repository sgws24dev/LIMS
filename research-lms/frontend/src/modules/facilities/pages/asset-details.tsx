import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useUIStore } from "@/store/uiStore"
import { PageContainer } from "@/shared/shared/page-container"
import { Button } from "@/shared/ui/button"
import { getAssetById, decommissionAsset, type AssetDetail } from "@/services/api/facilities"
import { AssetStatusBadge } from "../components/asset-status-badge"
import AssetTimeline from "../components/asset-timeline"
import CustodyChain from "../components/custody-chain"
import TelemetryWidget from "../components/telemetry-widget"
import CustodyTransferDialog from "./custody-transfer-dialog"
import QrLabelDialog from "./qr-label-dialog"
import { ArrowLeft, Pencil, QrCode, XCircle, Loader2, Package, Wrench, MapPin, Calendar, DollarSign, Hash, Cpu, Network, Tag, ArrowRightLeft } from "lucide-react"

export default function AssetDetailsPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { setBreadcrumbs } = useUIStore()
  const [asset, setAsset] = useState<AssetDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [decommissioning, setDecommissioning] = useState(false)
  const [transferOpen, setTransferOpen] = useState(false)
  const [qrOpen, setQrOpen] = useState(false)

  useEffect(() => {
    setBreadcrumbs([{ label: "Facilities" }, { label: "Assets", href: "/facilities/assets" }, { label: "Asset Details" }])
  }, [setBreadcrumbs])

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getAssetById(id)
      .then(setAsset)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id])

  const handleDecommission = async () => {
    if (!id) return
    setDecommissioning(true)
    try {
      await decommissionAsset(id)
      const updated = await getAssetById(id)
      setAsset(updated)
    } catch {
      // silently fail
    } finally {
      setDecommissioning(false)
    }
  }

  if (loading) {
    return (
      <PageContainer title="Asset Details" description="Loading...">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </PageContainer>
    )
  }

  if (notFound || !asset) {
    return (
      <PageContainer title="Asset Details" description="Asset not found">
        <p className="text-sm text-muted-foreground">The requested asset could not be found.</p>
      </PageContainer>
    )
  }

  const infoItems = [
    { icon: Package, label: "Category", value: asset.category },
    { icon: Cpu, label: "Manufacturer", value: asset.manufacturer || "—" },
    { icon: Wrench, label: "Model", value: asset.model || "—" },
    { icon: MapPin, label: "Location", value: asset.location || "—" },
    { icon: MapPin, label: "Facility", value: asset.facilityName || "—" },
    { icon: Calendar, label: "Acquired", value: asset.acquisitionDate || "—" },
    { icon: DollarSign, label: "Acquisition Cost", value: asset.acquisitionCost != null ? `$${asset.acquisitionCost.toLocaleString()}` : "—" },
    { icon: DollarSign, label: "Current Value", value: asset.currentValue != null ? `$${asset.currentValue.toLocaleString()}` : "—" },
    { icon: DollarSign, label: "Salvage Value", value: asset.salvageValue != null ? `$${asset.salvageValue.toLocaleString()}` : "—" },
    { icon: Hash, label: "Useful Life", value: asset.usefulLifeYears ? `${asset.usefulLifeYears} years` : "—" },
    { icon: Tag, label: "Depreciation", value: asset.depreciationMethod || "—" },
  ]

  return (
    <PageContainer
      title={asset.name}
      description={`Identifier: ${asset.identifier}`}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate("/facilities/assets")}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Button>
          <Button size="sm" onClick={() => navigate(`/facilities/assets/${asset.id}/edit`)}>
            <Pencil className="mr-1 h-4 w-4" /> Edit
          </Button>
          {asset.status !== "Decommissioned" && asset.status !== "Disposed" && (
            <Button variant="destructive" size="sm" onClick={handleDecommission} disabled={decommissioning}>
              <XCircle className="mr-1 h-4 w-4" /> {decommissioning ? "Decommissioning..." : "Decommission"}
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => setTransferOpen(true)}>
            <ArrowRightLeft className="mr-1 h-4 w-4" /> Transfer
          </Button>
          <Button variant="outline" size="sm" onClick={() => setQrOpen(true)}>
            <QrCode className="mr-1 h-4 w-4" /> QR
          </Button>
        </div>
      }
    >
      <div className="grid gap-6">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
            {asset.assetType}
          </span>
          <AssetStatusBadge status={asset.status} />
          {asset.qrCode && <span className="text-xs text-muted-foreground">QR: {asset.qrCode}</span>}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-border/50 bg-card shadow-card p-6 space-y-4">
            <h3 className="font-medium">Information</h3>
            <div className="space-y-3">
              {infoItems.map((item) => (
                <div key={item.label} className="flex items-center gap-3 text-sm">
                  <item.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground min-w-[120px]">{item.label}</span>
                  <span className="font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {asset.assetType === "Instrument" && (
            <div className="rounded-xl border border-border/50 bg-card shadow-card p-6 space-y-4">
              <h3 className="font-medium">Instrument Configuration</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Network className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground min-w-[120px]">IP Address</span>
                  <span className="font-medium">{asset.ipAddress || "—"}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Network className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground min-w-[120px]">Port</span>
                  <span className="font-medium">{asset.port ?? "—"}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Cpu className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground min-w-[120px]">Protocol</span>
                  <span className="font-medium">{asset.connectionProtocol || "—"}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Tag className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground min-w-[120px]">Firmware</span>
                  <span className="font-medium">{asset.firmware || "—"}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground min-w-[120px]">Last Calibration</span>
                  <span className="font-medium">{asset.lastCalibrationDate || "—"}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground min-w-[120px]">Next Calibration</span>
                  <span className="font-medium">{asset.nextCalibrationDate || "—"}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-muted-foreground min-w-[120px]">IoT Enabled</span>
                  <span className={`font-medium ${asset.iotEnabled ? "text-green-600" : "text-muted-foreground"}`}>
                    {asset.iotEnabled ? "Yes" : "No"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {asset.customFields && Object.keys(asset.customFields).length > 0 && (
            <div className="rounded-xl border border-border/50 bg-card shadow-card p-6 space-y-4">
              <h3 className="font-medium">Custom Fields</h3>
              <div className="overflow-hidden rounded-lg border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="px-4 py-2 text-left font-medium text-muted-foreground">Key</th>
                      <th className="px-4 py-2 text-left font-medium text-muted-foreground">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(asset.customFields).map(([key, value]) => (
                      <tr key={key} className="border-t">
                        <td className="px-4 py-2 font-medium">{key}</td>
                        <td className="px-4 py-2">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <CustodyChain assetId={asset.id} />
          {asset.assetType === "Instrument" ? (
            <TelemetryWidget instrumentId={asset.id} isIotEnabled={asset.iotEnabled} />
          ) : (
            <div className="rounded-xl border border-border/50 bg-card shadow-card p-6">
              <h4 className="font-medium mb-2">Telemetry</h4>
              <p className="text-sm text-muted-foreground">Telemetry is only available for instruments</p>
            </div>
          )}
        </div>

        <AssetTimeline assetId={asset.id} />
      </div>
      <CustodyTransferDialog
        assetId={asset.id}
        assetName={asset.name}
        currentLocation={asset.location || ""}
        open={transferOpen}
        onClose={() => setTransferOpen(false)}
        onSuccess={() => { if (id) getAssetById(id).then(setAsset) }}
      />
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
