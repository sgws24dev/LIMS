import { StatusBadge } from "@/shared/shared/status-badge"

type AssetStatus = "Active" | "UnderMaintenance" | "Decommissioned" | "Disposed"

const statusMap: Record<AssetStatus, string> = {
  Active: "active",
  UnderMaintenance: "warning",
  Decommissioned: "inactive",
  Disposed: "inactive",
}

export function AssetStatusBadge({ status }: { status: string }) {
  const mapped = statusMap[status as AssetStatus] ?? "default"
  return <StatusBadge status={mapped} />
}
