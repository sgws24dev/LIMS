import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { ArrowLeft, ExternalLink, Mail, Phone, Globe, MapPin } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'
import { getVendors, getPurchaseOrders, type VendorDto, type PurchaseOrderDto } from '@/services/api/inventory'

export default function VendorDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [vendor, setVendor] = useState<VendorDto | null>(null)
  const [recentPOs, setRecentPOs] = useState<PurchaseOrderDto[]>([])
  const [loading, setLoading] = useState(true)
  const setBreadcrumbs = useUIStore((s) => s.setBreadcrumbs)

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Inventory', href: '/inventory' },
      { label: 'Vendors', href: '/inventory/vendors' },
      { label: 'Vendor Details' },
    ])
  }, [setBreadcrumbs])

  useEffect(() => {
    if (!id) return
    setLoading(true)
    Promise.all([
      getVendors(false).then(v => v.find((v: VendorDto) => v.id === id)),
      getPurchaseOrders({ pageSize: 5 }),
    ]).then(([v, pos]) => {
      if (!v) return
      setVendor(v)
      setRecentPOs(pos.items.filter(po => po.vendorName === v.name))
    }).catch(() => {}).finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="p-6 text-muted-foreground">Loading...</div>
  if (!vendor) return <div className="p-6 text-red-500">Vendor not found.</div>

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumbs are set via useUIStore */}

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/inventory/vendors"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{vendor.name}</h1>
            <Badge className={`${vendor.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'} border-0`}>
              {vendor.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground font-mono">{vendor.code}</p>
        </div>
        <Button onClick={() => navigate(`/inventory/purchase-orders?vendorId=${vendor.id}`)}>
          View Purchase Orders
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-sm">Contact</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {vendor.contactPerson && (
              <div className="flex items-center gap-2"><span className="font-medium">{vendor.contactPerson}</span></div>
            )}
            {vendor.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${vendor.email}`} className="text-blue-600 hover:underline">{vendor.email}</a>
              </div>
            )}
            {vendor.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{vendor.phone}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Address</CardTitle></CardHeader>
          <CardContent className="text-sm">
            {vendor.address ? (
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span>{vendor.address}</span>
              </div>
            ) : (
              <span className="text-muted-foreground">No address on file</span>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Summary</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Items Supplied</span><span>{vendor.itemCount}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span>{vendor.isActive ? 'Active' : 'Inactive'}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Since</span><span>{new Date(vendor.createdAt).toLocaleDateString()}</span></div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Purchase Orders</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {recentPOs.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">No purchase orders for this vendor.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">PO Number</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-right p-3">Total</th>
                  <th className="text-left p-3">Created</th>
                </tr>
              </thead>
              <tbody>
                {recentPOs.map((po) => (
                  <tr key={po.id} className="border-b hover:bg-muted/50 cursor-pointer" onClick={() => navigate(`/inventory/purchase-orders`)}>
                    <td className="p-3 font-mono">{po.poNumber}</td>
                    <td className="p-3"><Badge className="border-0">{po.status}</Badge></td>
                    <td className="p-3 text-right">₹{po.totalAmount.toLocaleString()}</td>
                    <td className="p-3 text-muted-foreground">{new Date(po.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
