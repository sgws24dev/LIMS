export interface Vendor {
  id: string
  name: string
  contactPerson: string
  email: string
  phone: string
  address: string
  category: "Reagent" | "Consumable" | "Equipment" | "Service"
  status: "active" | "inactive"
  rating: number
  paymentTerms: string
  lastOrderDate: string
  totalOrders: number
}

export const vendors: Vendor[] = [
  {
    id: "V001",
    name: "MediSupply Co.",
    contactPerson: "Rahul Sharma",
    email: "rahul@medisupply.com",
    phone: "+91 98765 43210",
    address: "Mumbai, Maharashtra",
    category: "Reagent",
    status: "active",
    rating: 4.5,
    paymentTerms: "Net 30",
    lastOrderDate: "2026-05-15",
    totalOrders: 12,
  },
  {
    id: "V002",
    name: "LabTech Instruments",
    contactPerson: "Priya Patel",
    email: "priya@labtech.in",
    phone: "+91 87654 32109",
    address: "Bengaluru, Karnataka",
    category: "Equipment",
    status: "active",
    rating: 4.8,
    paymentTerms: "Net 45",
    lastOrderDate: "2026-06-01",
    totalOrders: 8,
  },
  {
    id: "V003",
    name: "Consumables World",
    contactPerson: "Amit Verma",
    email: "amit@consumablesworld.com",
    phone: "+91 76543 21098",
    address: "Delhi, Delhi",
    category: "Consumable",
    status: "active",
    rating: 4.2,
    paymentTerms: "Net 15",
    lastOrderDate: "2026-05-28",
    totalOrders: 25,
  },
  {
    id: "V004",
    name: "Global Diagnostics",
    contactPerson: "Sneha Reddy",
    email: "sneha@globaldiag.com",
    phone: "+91 65432 10987",
    address: "Hyderabad, Telangana",
    category: "Reagent",
    status: "inactive",
    rating: 3.8,
    paymentTerms: "Net 60",
    lastOrderDate: "2026-02-10",
    totalOrders: 5,
  },
  {
    id: "V005",
    name: "ServiCare Lab Solutions",
    contactPerson: "Vikram Joshi",
    email: "vikram@servicare.in",
    phone: "+91 54321 09876",
    address: "Pune, Maharashtra",
    category: "Service",
    status: "active",
    rating: 4.0,
    paymentTerms: "Net 30",
    lastOrderDate: "2026-06-10",
    totalOrders: 15,
  },
  {
    id: "V006",
    name: "BioReliable Supplies",
    contactPerson: "Ananya Gupta",
    email: "ananya@bioreliable.com",
    phone: "+91 43210 98765",
    address: "Chennai, Tamil Nadu",
    category: "Consumable",
    status: "inactive",
    rating: 3.5,
    paymentTerms: "Net 30",
    lastOrderDate: "2026-01-20",
    totalOrders: 3,
  },
]
