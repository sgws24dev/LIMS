import { payments } from "./payments"

export interface PurchaseOrderItem {
  id: string
  name: string
  sku: string
  quantity: number
  unitPrice: number
  total: number
}

export type POStatus = "draft" | "pending" | "approved" | "received" | "cancelled"

export interface PurchaseOrder {
  id: string
  poNumber: string
  vendor: string
  vendorId: string
  items: PurchaseOrderItem[]
  totalAmount: number
  status: POStatus
  createdDate: string
  expectedDelivery: string
  notes?: string
}

export const vendors = [
  { id: "VND001", name: "Patho-Tech Diagnostics Pvt Ltd", city: "Mumbai" },
  { id: "VND002", name: "MediLab Reagents & Supplies", city: "Delhi" },
  { id: "VND003", name: "BioGenix Healthcare Ltd", city: "Bangalore" },
  { id: "VND004", name: "Sysmex India Pvt Ltd", city: "Mumbai" },
  { id: "VND005", name: "ThermoFisher Scientific India", city: "Hyderabad" },
  { id: "VND006", name: "LabMart India", city: "Pune" },
]

export const purchaseOrders: PurchaseOrder[] = [
  {
    id: "PO001", poNumber: "PO-2026-0001", vendor: "Patho-Tech Diagnostics Pvt Ltd", vendorId: "VND001",
    items: [
      { id: "POI001", name: "Glucose GOD-POD Reagent Kit", sku: "RGT-GLU-001", quantity: 5, unitPrice: 4500, total: 22500 },
      { id: "POI002", name: "Total Cholesterol CHOD-PAP Reagent", sku: "RGT-CHOL-002", quantity: 3, unitPrice: 5200, total: 15600 },
    ],
    totalAmount: 38100, status: "received", createdDate: "2026-05-20T09:00:00Z", expectedDelivery: "2026-05-30T00:00:00Z", notes: "Urgent - running low on glucose reagent",
  },
  {
    id: "PO002", poNumber: "PO-2026-0002", vendor: "MediLab Reagents & Supplies", vendorId: "VND002",
    items: [
      { id: "POI003", name: "HDL Cholesterol Direct Reagent", sku: "RGT-HDL-004", quantity: 2, unitPrice: 5800, total: 11600 },
      { id: "POI004", name: "CRP Immunoturbidimetry Reagent", sku: "RGT-CRP-015", quantity: 3, unitPrice: 6000, total: 18000 },
    ],
    totalAmount: 29600, status: "approved", createdDate: "2026-06-01T10:00:00Z", expectedDelivery: "2026-06-15T00:00:00Z",
  },
  {
    id: "PO003", poNumber: "PO-2026-0003", vendor: "BioGenix Healthcare Ltd", vendorId: "VND003",
    items: [
      { id: "POI005", name: "TSH CLIA Reagent Cartridge", sku: "RGT-TSH-007", quantity: 3, unitPrice: 12000, total: 36000 },
      { id: "POI006", name: "Free T4 CLIA Reagent Cartridge", sku: "RGT-FT4-008", quantity: 2, unitPrice: 11000, total: 22000 },
      { id: "POI007", name: "Vitamin D CLIA Reagent", sku: "RGT-VITD-013", quantity: 2, unitPrice: 14500, total: 29000 },
    ],
    totalAmount: 87000, status: "pending", createdDate: "2026-06-08T11:00:00Z", expectedDelivery: "2026-06-22T00:00:00Z",
  },
  {
    id: "PO004", poNumber: "PO-2026-0004", vendor: "Sysmex India Pvt Ltd", vendorId: "VND004",
    items: [
      { id: "POI008", name: "Sysmex XN-1000 Diluent", sku: "RGT-DIL-011", quantity: 5, unitPrice: 2500, total: 12500 },
      { id: "POI009", name: "Sysmex XN-1000 Lysing Agent", sku: "RGT-LYS-012", quantity: 3, unitPrice: 3800, total: 11400 },
    ],
    totalAmount: 23900, status: "pending", createdDate: "2026-06-10T09:00:00Z", expectedDelivery: "2026-06-25T00:00:00Z",
  },
  {
    id: "PO005", poNumber: "PO-2026-0005", vendor: "LabMart India", vendorId: "VND006",
    items: [
      { id: "POI010", name: "Vacutainer SST (Gold Top) 5mL", sku: "CNS-SST-017", quantity: 500, unitPrice: 8, total: 4000 },
      { id: "POI011", name: "Vacutainer EDTA (Purple Top) 3mL", sku: "CNS-EDTA-018", quantity: 300, unitPrice: 7, total: 2100 },
      { id: "POI012", name: "Disposable Syringe 5mL", sku: "CNS-SYR5-020", quantity: 500, unitPrice: 5, total: 2500 },
    ],
    totalAmount: 8600, status: "draft", createdDate: "2026-06-11T08:00:00Z", expectedDelivery: "2026-06-28T00:00:00Z",
  },
  {
    id: "PO006", poNumber: "PO-2026-0006", vendor: "ThermoFisher Scientific India", vendorId: "VND005",
    items: [
      { id: "POI013", name: "PT/INR Thromboplastin Reagent", sku: "RGT-PT-016", quantity: 3, unitPrice: 7500, total: 22500 },
    ],
    totalAmount: 22500, status: "approved", createdDate: "2026-06-05T10:00:00Z", expectedDelivery: "2026-06-18T00:00:00Z",
  },
  {
    id: "PO007", poNumber: "PO-2026-0007", vendor: "Patho-Tech Diagnostics Pvt Ltd", vendorId: "VND001",
    items: [
      { id: "POI014", name: "ALT (SGPT) Reagent IFCC", sku: "RGT-ALT-005", quantity: 4, unitPrice: 3500, total: 14000 },
      { id: "POI015", name: "Creatinine Jaffe Reagent Kit", sku: "RGT-CREAT-006", quantity: 3, unitPrice: 3200, total: 9600 },
    ],
    totalAmount: 23600, status: "cancelled", createdDate: "2026-05-15T08:00:00Z", expectedDelivery: "2026-05-28T00:00:00Z", notes: "Cancelled due to pricing dispute",
  },
  {
    id: "PO008", poNumber: "PO-2026-0008", vendor: "LabMart India", vendorId: "VND006",
    items: [
      { id: "POI016", name: "Latex Examination Gloves (Box of 100)", sku: "CNS-GLOVES-025", quantity: 20, unitPrice: 350, total: 7000 },
      { id: "POI017", name: "Nitrile Gloves (Box of 100)", sku: "CNS-NITRILE-026", quantity: 10, unitPrice: 450, total: 4500 },
      { id: "POI018", name: "Disposable Lab Coats (Pack of 10)", sku: "CNS-COAT-028", quantity: 5, unitPrice: 1200, total: 6000 },
    ],
    totalAmount: 17500, status: "received", createdDate: "2026-06-02T09:00:00Z", expectedDelivery: "2026-06-12T00:00:00Z",
  },
]

export const stockMovements = [
  { id: "SM001", itemName: "Glucose GOD-POD Reagent Kit", sku: "RGT-GLU-001", type: "in", quantity: 5, date: "2026-06-10T09:00:00Z", reference: "PO-2026-0001", user: "Dr. Mehta" },
  { id: "SM002", itemName: "TSH CLIA Reagent Cartridge", sku: "RGT-TSH-007", type: "out", quantity: 1, date: "2026-06-09T10:00:00Z", reference: "Daily Usage", user: "Tech. Sharma" },
  { id: "SM003", itemName: "HbA1c HPLC Column & Reagent", sku: "RGT-HBA1C-010", type: "out", quantity: 2, date: "2026-06-08T11:00:00Z", reference: "Daily Usage", user: "Tech. Verma" },
  { id: "SM004", itemName: "Free T3 CLIA Reagent Cartridge", sku: "RGT-FT3-009", type: "in", quantity: 2, date: "2026-06-07T08:00:00Z", reference: "Adjustment", user: "Dr. Mehta" },
  { id: "SM005", itemName: "Vacutainer SST (Gold Top) 5mL", sku: "CNS-SST-017", type: "out", quantity: 50, date: "2026-06-06T09:00:00Z", reference: "Daily Usage", user: "Staff. Patil" },
  { id: "SM006", itemName: "Creatinine Jaffe Reagent Kit", sku: "RGT-CREAT-006", type: "out", quantity: 2, date: "2026-06-05T10:00:00Z", reference: "Daily Usage", user: "Tech. Khan" },
  { id: "SM007", itemName: "Latex Examination Gloves (Box of 100)", sku: "CNS-GLOVES-025", type: "in", quantity: 20, date: "2026-06-04T08:00:00Z", reference: "PO-2026-0008", user: "Dr. Mehta" },
  { id: "SM008", itemName: "CRP Immunoturbidimetry Reagent", sku: "RGT-CRP-015", type: "out", quantity: 1, date: "2026-06-03T14:00:00Z", reference: "QC Testing", user: "Tech. Rao" },
]

export const getDailyCollectionData = (): { date: string; amount: number }[] => {
  const days = ["2026-06-01", "2026-06-02", "2026-06-03", "2026-06-04", "2026-06-05",
    "2026-06-06", "2026-06-07", "2026-06-08", "2026-06-09", "2026-06-10"]
  return days.map((date) => ({
    date,
    amount: payments
      .filter((p) => p.date.startsWith(date) && p.status === "completed")
      .reduce((sum, p) => sum + p.amount, 0),
  }))
}

export const getPendingPayments = () => payments.filter((p) => p.status === "pending" || p.status === "failed")

export const getCategoryWiseStockCount = () => {
  const inventory = [
    { category: "reagent", count: 16 }, { category: "consumable", count: 15 }, { category: "equipment", count: 4 },
  ]
  return inventory
}
