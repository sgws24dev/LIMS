import api from '@/lib/api'

export type InventoryItemStatus = 'Available' | 'LowStock' | 'OutOfStock' | 'Discontinued' | 'Quarantined'
export type MovementType = 'In' | 'Out' | 'Adjustment'
export type PurchaseOrderStatus = 'Draft' | 'Pending' | 'Approved' | 'Shipped' | 'Received' | 'Cancelled'

export interface InventoryItemDto {
  id: string
  name: string
  sku: string
  description?: string
  category?: string
  quantity: number
  unit?: string
  unitPrice: number
  totalValue: number
  reorderLevel: number
  reorderQuantity: number
  location?: string
  status: InventoryItemStatus
  barcode?: string
  vendorName?: string
  expiryDate?: string
  isLowStock: boolean
  isOutOfStock: boolean
  createdAt: string
}

export interface StockMovementDto {
  id: string
  movementType: MovementType
  quantity: number
  balanceBefore: number
  balanceAfter: number
  referenceType?: string
  notes?: string
  performedByName?: string
  createdAt: string
}

export interface InventoryItemDetailDto extends InventoryItemDto {
  imageUrl?: string
  vendorId?: string
  specifications?: string
  updatedAt?: string
  recentMovements: StockMovementDto[]
}

export interface InventoryDashboardStatsDto {
  totalItems: number
  lowStockCount: number
  outOfStockCount: number
  expiringCount: number
  totalVendors: number
  pendingPoCount: number
  totalInventoryValue: number
}

export interface VendorDto {
  id: string
  name: string
  code: string
  contactPerson?: string
  email?: string
  phone?: string
  address?: string
  isActive: boolean
  itemCount: number
  createdAt: string
}

export interface PurchaseOrderDto {
  id: string
  poNumber: string
  vendorName: string
  orderDate: string
  expectedDeliveryDate?: string
  status: PurchaseOrderStatus
  totalAmount: number
  itemCount: number
  notes?: string
  createdAt: string
}

export interface PurchaseOrderItemDto {
  id: string
  inventoryItemId: string
  itemName: string
  itemSku: string
  quantity: number
  quantityReceived: number
  unitPrice: number
  totalPrice: number
}

export interface PurchaseOrderDetailDto extends PurchaseOrderDto {
  vendorId: string
  items: PurchaseOrderItemDto[]
}

export interface CreateInventoryItemRequest {
  name: string
  sku: string
  description?: string
  category?: string
  quantity: number
  unit?: string
  unitPrice: number
  reorderLevel: number
  reorderQuantity: number
  location?: string
  barcode?: string
  imageUrl?: string
  vendorId?: string
  expiryDate?: string
  specifications?: string
}

export interface CreateVendorRequest {
  name: string
  code: string
  contactPerson?: string
  email?: string
  phone?: string
  address?: string
}

export interface CreatePurchaseOrderRequest {
  poNumber: string
  vendorId: string
  expectedDeliveryDate?: string
  notes?: string
  items: { inventoryItemId: string; quantity: number; unitPrice: number }[]
}

export interface PagedResult<T> {
  items: T[]
  totalCount: number
  page: number
  pageSize: number
}

export interface LowStockAlertDto {
  itemId: string
  sku: string
  name: string
  category: string
  quantityOnHand: number
  reorderPoint: number
  reorderQuantity: number
  location?: string
  vendorName?: string
}

export interface ExpiringItemDto {
  itemId: string
  sku: string
  name: string
  category: string
  quantityOnHand: number
  expiryDate: string
  daysUntilExpiry: number
  isHazardous: boolean
  location?: string
}

// Inventory Items
export async function getInventoryItems(params?: {
  search?: string
  category?: string
  status?: InventoryItemStatus
  vendorId?: string
  page?: number
  pageSize?: number
}): Promise<PagedResult<InventoryItemDto>> {
  const { data } = await api.get('/inventory/items', { params })
  return data
}

export async function getInventoryItemById(id: string): Promise<InventoryItemDetailDto> {
  const { data } = await api.get(`/inventory/items/${id}`)
  return data
}

export async function getInventoryDashboardStats(): Promise<InventoryDashboardStatsDto> {
  const { data } = await api.get('/inventory/items/dashboard')
  return data
}

export async function getInventoryCategories(): Promise<string[]> {
  const { data } = await api.get('/inventory/items/categories')
  return data
}

export async function getLowStockAlerts(): Promise<LowStockAlertDto[]> {
  const { data } = await api.get('/inventory/items/low-stock')
  return data
}

export async function getExpiringItems(daysAhead = 30): Promise<ExpiringItemDto[]> {
  const { data } = await api.get('/inventory/items/expiring', { params: { daysAhead } })
  return data
}

export async function getItemByBarcode(barcode: string): Promise<InventoryItemDto> {
  const { data } = await api.get(`/inventory/items/by-barcode/${encodeURIComponent(barcode)}`)
  return data
}

export async function createInventoryItem(request: CreateInventoryItemRequest): Promise<string> {
  const { data } = await api.post('/inventory/items', request)
  return data
}

export async function updateInventoryItem(id: string, request: CreateInventoryItemRequest): Promise<void> {
  await api.put(`/inventory/items/${id}`, { ...request, itemId: id })
}

export async function adjustStock(itemId: string, newQuantity: number, notes?: string): Promise<void> {
  await api.put(`/inventory/items/${itemId}/stock`, { itemId, newQuantity, notes })
}

export async function recordReceipt(itemId: string, request: {
  quantity: number
  unitCost: number
  purchaseOrderId?: string
  notes?: string
  performedById?: string
  performedByName?: string
}): Promise<void> {
  await api.post(`/inventory/items/${itemId}/receipt`, { ...request, itemId })
}

export async function issueStock(itemId: string, request: {
  quantity: number
  referenceType?: string
  referenceId?: string
  notes?: string
  performedById?: string
  performedByName?: string
}): Promise<void> {
  await api.post(`/inventory/items/${itemId}/issue`, { ...request, itemId })
}

export async function writeOffStock(itemId: string, request: {
  quantity: number
  reason: string
  performedById?: string
  performedByName?: string
}): Promise<void> {
  await api.post(`/inventory/items/${itemId}/write-off`, { ...request, itemId })
}

export async function deleteInventoryItem(id: string): Promise<void> {
  await api.delete(`/inventory/items/${id}`)
}

export async function getStockLedger(itemId: string, page = 1, pageSize = 25): Promise<PagedResult<StockMovementDto>> {
  const { data } = await api.get(`/inventory/items/${itemId}/ledger`, { params: { page, pageSize } })
  return data
}

// Vendors
export async function getVendors(activeOnly = true): Promise<VendorDto[]> {
  const { data } = await api.get('/inventory/vendors', { params: { activeOnly } })
  return data
}

export async function getVendorById(id: string): Promise<VendorDto> {
  const { data } = await api.get(`/inventory/vendors/${id}`)
  return data
}

export async function getVendorPerformance(vendorId: string): Promise<{
  vendorId: string
  vendorName: string
  totalOrders: number
}> {
  const { data } = await api.get(`/inventory/vendors/${vendorId}/performance`)
  return data
}

export async function createVendor(request: CreateVendorRequest): Promise<string> {
  const { data } = await api.post('/inventory/vendors', request)
  return data
}

export async function updateVendor(id: string, request: {
  name: string
  contactPerson?: string
  email?: string
  phone?: string
  address?: string
  isActive: boolean
}): Promise<void> {
  await api.put(`/inventory/vendors/${id}`, { ...request, vendorId: id })
}

// Purchase Orders
export async function getPurchaseOrders(params?: {
  status?: PurchaseOrderStatus
  vendorId?: string
  page?: number
  pageSize?: number
}): Promise<PagedResult<PurchaseOrderDto>> {
  const { data } = await api.get('/inventory/purchase-orders', { params })
  return data
}

export async function getPurchaseOrderById(id: string): Promise<PurchaseOrderDetailDto> {
  const { data } = await api.get(`/inventory/purchase-orders/${id}`)
  return data
}

export async function createPurchaseOrder(request: CreatePurchaseOrderRequest): Promise<string> {
  const { data } = await api.post('/inventory/purchase-orders', request)
  return data
}

export async function submitPurchaseOrder(id: string): Promise<void> {
  await api.post(`/inventory/purchase-orders/${id}/submit`)
}

export async function approvePurchaseOrder(id: string, approvedById: string, approvedByName: string): Promise<void> {
  await api.post(`/inventory/purchase-orders/${id}/approve`, { approvedById, approvedByName })
}

export async function sendPurchaseOrder(id: string): Promise<void> {
  await api.post(`/inventory/purchase-orders/${id}/send`)
}

export async function receivePurchaseOrderItems(id: string, receivedLines: { lineId: string; quantityReceived: number }[], receivedById: string, receivedByName: string): Promise<void> {
  await api.post(`/inventory/purchase-orders/${id}/receive`, { purchaseOrderId: id, receivedLines, receivedById, receivedByName })
}

export async function cancelPurchaseOrder(id: string, reason: string, cancelledById: string): Promise<void> {
  await api.delete(`/inventory/purchase-orders/${id}`, { data: { reason, cancelledById } })
}

export async function addPurchaseOrderItem(id: string, inventoryItemId: string, quantity: number, unitPrice: number): Promise<void> {
  await api.post(`/inventory/purchase-orders/${id}/items`, { purchaseOrderId: id, inventoryItemId, quantity, unitPrice })
}

export async function removePurchaseOrderItem(id: string, lineId: string): Promise<void> {
  await api.delete(`/inventory/purchase-orders/${id}/items/${lineId}`)
}

export async function updatePurchaseOrderStatus(id: string, newStatus: PurchaseOrderStatus): Promise<void> {
  await api.put(`/inventory/purchase-orders/${id}/status`, { newStatus })
}
