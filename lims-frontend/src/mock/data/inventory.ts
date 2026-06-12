import type { InventoryItem } from "@/types"

export const inventory: InventoryItem[] = [
  // Reagents
  {
    id: "INV001", name: "Glucose GOD-POD Reagent Kit", category: "reagent", sku: "RGT-GLU-001",
    quantity: 12, unit: "kit", minQuantity: 3, maxQuantity: 20, batchNo: "BCH-GLU-2401",
    expiryDate: "2026-12-15", vendorId: "VND001", price: 4500, location: "Rack A-1", isActive: true,
  },
  {
    id: "INV002", name: "Total Cholesterol CHOD-PAP Reagent", category: "reagent", sku: "RGT-CHOL-002",
    quantity: 8, unit: "kit", minQuantity: 3, maxQuantity: 15, batchNo: "BCH-CHOL-2402",
    expiryDate: "2026-11-30", vendorId: "VND001", price: 5200, location: "Rack A-2", isActive: true,
  },
  {
    id: "INV003", name: "Triglycerides GPO-PAP Reagent", category: "reagent", sku: "RGT-TG-003",
    quantity: 5, unit: "kit", minQuantity: 3, maxQuantity: 15, batchNo: "BCH-TG-2403",
    expiryDate: "2026-10-20", vendorId: "VND001", price: 4800, location: "Rack A-2", isActive: true,
  },
  {
    id: "INV004", name: "HDL Cholesterol Direct Reagent", category: "reagent", sku: "RGT-HDL-004",
    quantity: 2, unit: "kit", minQuantity: 3, maxQuantity: 10, batchNo: "BCH-HDL-2404",
    expiryDate: "2026-09-15", vendorId: "VND002", price: 5800, location: "Rack A-3", isActive: true,
  },
  {
    id: "INV005", name: "ALT (SGPT) Reagent IFCC", category: "reagent", sku: "RGT-ALT-005",
    quantity: 10, unit: "kit", minQuantity: 3, maxQuantity: 15, batchNo: "BCH-ALT-2405",
    expiryDate: "2026-12-01", vendorId: "VND001", price: 3500, location: "Rack B-1", isActive: true,
  },
  {
    id: "INV006", name: "Creatinine Jaffe Reagent Kit", category: "reagent", sku: "RGT-CREAT-006",
    quantity: 15, unit: "kit", minQuantity: 3, maxQuantity: 20, batchNo: "BCH-CR-2406",
    expiryDate: "2027-01-10", vendorId: "VND002", price: 3200, location: "Rack B-1", isActive: true,
  },
  {
    id: "INV007", name: "TSH CLIA Reagent Cartridge", category: "reagent", sku: "RGT-TSH-007",
    quantity: 4, unit: "cartridge", minQuantity: 2, maxQuantity: 10, batchNo: "BCH-TSH-2407",
    expiryDate: "2026-08-25", vendorId: "VND003", price: 12000, location: "Rack C-1 (Fridge)", isActive: true,
  },
  {
    id: "INV008", name: "Free T4 CLIA Reagent Cartridge", category: "reagent", sku: "RGT-FT4-008",
    quantity: 3, unit: "cartridge", minQuantity: 2, maxQuantity: 8, batchNo: "BCH-FT4-2408",
    expiryDate: "2026-09-10", vendorId: "VND003", price: 11000, location: "Rack C-1 (Fridge)", isActive: true,
  },
  {
    id: "INV009", name: "Free T3 CLIA Reagent Cartridge", category: "reagent", sku: "RGT-FT3-009",
    quantity: 1, unit: "cartridge", minQuantity: 2, maxQuantity: 8, batchNo: "BCH-FT3-2409",
    expiryDate: "2026-07-15", vendorId: "VND003", price: 11000, location: "Rack C-2 (Fridge)", isActive: true,
  },
  {
    id: "INV010", name: "HbA1c HPLC Column & Reagent", category: "reagent", sku: "RGT-HBA1C-010",
    quantity: 6, unit: "set", minQuantity: 2, maxQuantity: 10, batchNo: "BCH-HBA-2410",
    expiryDate: "2026-12-20", vendorId: "VND004", price: 8500, location: "Rack B-2", isActive: true,
  },
  {
    id: "INV011", name: "Sysmex XN-1000 Diluent", category: "reagent", sku: "RGT-DIL-011",
    quantity: 8, unit: "L", minQuantity: 3, maxQuantity: 15, batchNo: "BCH-DIL-2411",
    expiryDate: "2026-11-01", vendorId: "VND004", price: 2500, location: "Rack D-1", isActive: true,
  },
  {
    id: "INV012", name: "Sysmex XN-1000 Lysing Agent", category: "reagent", sku: "RGT-LYS-012",
    quantity: 4, unit: "L", minQuantity: 2, maxQuantity: 10, batchNo: "BCH-LYS-2412",
    expiryDate: "2026-10-15", vendorId: "VND004", price: 3800, location: "Rack D-1", isActive: true,
  },
  {
    id: "INV013", name: "Vitamin D CLIA Reagent", category: "reagent", sku: "RGT-VITD-013",
    quantity: 5, unit: "cartridge", minQuantity: 2, maxQuantity: 8, batchNo: "BCH-VD-2413",
    expiryDate: "2026-10-30", vendorId: "VND003", price: 14500, location: "Rack C-2 (Fridge)", isActive: true,
  },
  {
    id: "INV014", name: "Vitamin B12 CLIA Reagent", category: "reagent", sku: "RGT-VITB12-014",
    quantity: 4, unit: "cartridge", minQuantity: 2, maxQuantity: 8, batchNo: "BCH-VB12-2414",
    expiryDate: "2026-11-15", vendorId: "VND003", price: 13500, location: "Rack C-2 (Fridge)", isActive: true,
  },
  {
    id: "INV015", name: "CRP Immunoturbidimetry Reagent", category: "reagent", sku: "RGT-CRP-015",
    quantity: 7, unit: "kit", minQuantity: 3, maxQuantity: 12, batchNo: "BCH-CRP-2415",
    expiryDate: "2026-12-05", vendorId: "VND002", price: 6000, location: "Rack B-3", isActive: true,
  },
  {
    id: "INV016", name: "PT/INR Thromboplastin Reagent", category: "reagent", sku: "RGT-PT-016",
    quantity: 3, unit: "kit", minQuantity: 2, maxQuantity: 8, batchNo: "BCH-PT-2416",
    expiryDate: "2026-08-20", vendorId: "VND005", price: 7500, location: "Rack D-2", isActive: true,
  },
  // Consumables
  {
    id: "INV017", name: "Vacutainer SST (Gold Top) 5mL", category: "consumable", sku: "CNS-SST-017",
    quantity: 500, unit: "pcs", minQuantity: 100, maxQuantity: 1000, price: 8, location: "Store A", isActive: true,
  },
  {
    id: "INV018", name: "Vacutainer EDTA (Purple Top) 3mL", category: "consumable", sku: "CNS-EDTA-018",
    quantity: 350, unit: "pcs", minQuantity: 100, maxQuantity: 800, price: 7, location: "Store A", isActive: true,
  },
  {
    id: "INV019", name: "Vacutainer Sodium Citrate (Blue Top) 2.7mL", category: "consumable", sku: "CNS-CIT-019",
    quantity: 150, unit: "pcs", minQuantity: 50, maxQuantity: 400, price: 9, location: "Store A", isActive: true,
  },
  {
    id: "INV020", name: "Disposable Syringe 5mL", category: "consumable", sku: "CNS-SYR5-020",
    quantity: 800, unit: "pcs", minQuantity: 200, maxQuantity: 1500, price: 5, location: "Store B", isActive: true,
  },
  {
    id: "INV021", name: "Disposable Syringe 10mL", category: "consumable", sku: "CNS-SYR10-021",
    quantity: 600, unit: "pcs", minQuantity: 150, maxQuantity: 1000, price: 6, location: "Store B", isActive: true,
  },
  {
    id: "INV022", name: "Microscope Slides (Box of 50)", category: "consumable", sku: "CNS-SLIDE-022",
    quantity: 25, unit: "box", minQuantity: 5, maxQuantity: 40, price: 120, location: "Store C", isActive: true,
  },
  {
    id: "INV023", name: "Cover Slips (Box of 100)", category: "consumable", sku: "CNS-COVER-023",
    quantity: 18, unit: "box", minQuantity: 5, maxQuantity: 30, price: 80, location: "Store C", isActive: true,
  },
  {
    id: "INV024", name: "Urine Collection Container 50mL", category: "consumable", sku: "CNS-URINE-024",
    quantity: 200, unit: "pcs", minQuantity: 50, maxQuantity: 500, price: 4, location: "Store A", isActive: true,
  },
  {
    id: "INV025", name: "Latex Examination Gloves (Box of 100)", category: "consumable", sku: "CNS-GLOVES-025",
    quantity: 40, unit: "box", minQuantity: 10, maxQuantity: 60, price: 350, location: "Store D", isActive: true,
  },
  {
    id: "INV026", name: "Nitrile Gloves (Box of 100)", category: "consumable", sku: "CNS-NITRILE-026",
    quantity: 10, unit: "box", minQuantity: 10, maxQuantity: 30, batchNo: "BCH-NIT-2601",
    price: 450, location: "Store D", isActive: true,
  },
  {
    id: "INV027", name: "PCR Tube Strips (8-tube, pack of 120)", category: "consumable", sku: "CNS-PCR-027",
    quantity: 8, unit: "pack", minQuantity: 3, maxQuantity: 15, price: 280, location: "Store E (Cold)", isActive: true,
  },
  {
    id: "INV028", name: "Disposable Lab Coats (Pack of 10)", category: "consumable", sku: "CNS-COAT-028",
    quantity: 6, unit: "pack", minQuantity: 3, maxQuantity: 15, price: 1200, location: "Store D", isActive: true,
  },
  {
    id: "INV029", name: "Microcentrifuge Tubes 1.5mL (Pack of 500)", category: "consumable", sku: "CNS-MCT-029",
    quantity: 15, unit: "pack", minQuantity: 5, maxQuantity: 25, price: 450, location: "Store C", isActive: true,
  },
  {
    id: "INV030", name: "Pipette Tips 100-1000µL (Box of 1000)", category: "consumable", sku: "CNS-TIP1-030",
    quantity: 20, unit: "box", minQuantity: 5, maxQuantity: 30, price: 320, location: "Store C", isActive: true,
  },
  {
    id: "INV031", name: "Pipette Tips 1-200µL (Box of 1000)", category: "consumable", sku: "CNS-TIP2-031",
    quantity: 25, unit: "box", minQuantity: 5, maxQuantity: 30, price: 280, location: "Store C", isActive: true,
  },
  // Equipment
  {
    id: "INV032", name: "Micropipette Single Channel 100-1000µL", category: "equipment", sku: "EQP-PIP-032",
    quantity: 4, unit: "pcs", minQuantity: 2, maxQuantity: 8, price: 8500, location: "Lab Bench 1", isActive: true,
  },
  {
    id: "INV033", name: "Refrigerated Centrifuge", category: "equipment", sku: "EQP-CENT-033",
    quantity: 2, unit: "pcs", minQuantity: 1, maxQuantity: 4, price: 185000, location: "Centrifuge Room", isActive: true,
  },
  {
    id: "INV034", name: "Biological Safety Cabinet Class II", category: "equipment", sku: "EQP-BSC-034",
    quantity: 1, unit: "pcs", minQuantity: 1, maxQuantity: 3, price: 320000, location: "Microbiology Lab", isActive: true,
  },
  {
    id: "INV035", name: "Incubator 37°C", category: "equipment", sku: "EQP-INC-035",
    quantity: 3, unit: "pcs", minQuantity: 1, maxQuantity: 5, price: 45000, location: "Microbiology Lab", isActive: true,
  },
]

export const getLowStockItems = (): InventoryItem[] =>
  inventory.filter((i) => i.category !== "equipment" && i.quantity <= i.minQuantity)

export const getExpiringItems = (days = 90): InventoryItem[] =>
  inventory.filter((i) => {
    if (!i.expiryDate) return false
    const expiry = new Date(i.expiryDate).getTime()
    const now = Date.now()
    const diffDays = (expiry - now) / (1000 * 60 * 60 * 24)
    return diffDays > 0 && diffDays <= days
  })
