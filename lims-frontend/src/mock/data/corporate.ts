export interface CorporateAccount {
  id: string
  name: string
  contactPerson: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  discount: number
  contractStart: string
  contractEnd: string
  status: "active" | "suspended" | "expired"
  employeeCount: number
  monthlyTests: number
  totalRevenue: number
  createdAt: string
}

export interface CorporateContract {
  id: string
  corporateId: string
  name: string
  testIds: string[]
  packageIds: string[]
  negotiatedPrice: number
  discount: number
  startDate: string
  endDate: string
  status: "active" | "expired" | "terminated"
}

export const corporateAccounts: CorporateAccount[] = [
  {
    id: "CORP001",
    name: "Tata Consultancy Services",
    contactPerson: "Rajiv Kulkarni",
    email: "rajiv.kulkarni@tcs.com",
    phone: "+91 98200 20001",
    address: "TCS House, 42 ITPL Road, Whitefield",
    city: "Bangalore",
    state: "Karnataka",
    discount: 25,
    contractStart: "2025-01-01T00:00:00Z",
    contractEnd: "2026-12-31T00:00:00Z",
    status: "active",
    employeeCount: 45000,
    monthlyTests: 850,
    totalRevenue: 4250000,
    createdAt: "2024-12-15T00:00:00Z",
  },
  {
    id: "CORP002",
    name: "Reliance Industries Ltd",
    contactPerson: "Amit Shah",
    email: "amit.shah@ril.com",
    phone: "+91 98200 20002",
    address: "3rd Floor, Maker Chamber IV, Nariman Point",
    city: "Mumbai",
    state: "Maharashtra",
    discount: 20,
    contractStart: "2025-03-01T00:00:00Z",
    contractEnd: "2026-08-31T00:00:00Z",
    status: "active",
    employeeCount: 35000,
    monthlyTests: 620,
    totalRevenue: 3100000,
    createdAt: "2025-02-15T00:00:00Z",
  },
  {
    id: "CORP003",
    name: "Infosys Limited",
    contactPerson: "Sundar Rajan",
    email: "sundar.rajan@infosys.com",
    phone: "+91 98200 20003",
    address: "Infosys Campus, Electronics City",
    city: "Bangalore",
    state: "Karnataka",
    discount: 22,
    contractStart: "2025-06-01T00:00:00Z",
    contractEnd: "2026-11-30T00:00:00Z",
    status: "active",
    employeeCount: 28000,
    monthlyTests: 540,
    totalRevenue: 2700000,
    createdAt: "2025-05-15T00:00:00Z",
  },
  {
    id: "CORP004",
    name: "HDFC Bank Ltd",
    contactPerson: "Priya Mehta",
    email: "priya.mehta@hdfcbank.com",
    phone: "+91 98200 20004",
    address: "HDFC Bank House, 88 Sandoz Building, Senapati Bapat Marg",
    city: "Mumbai",
    state: "Maharashtra",
    discount: 18,
    contractStart: "2025-09-01T00:00:00Z",
    contractEnd: "2026-09-30T00:00:00Z",
    status: "active",
    employeeCount: 22000,
    monthlyTests: 380,
    totalRevenue: 1900000,
    createdAt: "2025-08-10T00:00:00Z",
  },
  {
    id: "CORP005",
    name: "Apollo Hospitals Enterprise",
    contactPerson: "Dr. Nandkumar Rao",
    email: "nandkumar.rao@apollohospitals.com",
    phone: "+91 98200 20005",
    address: "Apollo Health City, Jubilee Hills",
    city: "Hyderabad",
    state: "Telangana",
    discount: 30,
    contractStart: "2025-04-01T00:00:00Z",
    contractEnd: "2027-03-31T00:00:00Z",
    status: "active",
    employeeCount: 15000,
    monthlyTests: 720,
    totalRevenue: 3600000,
    createdAt: "2025-03-20T00:00:00Z",
  },
  {
    id: "CORP006",
    name: "Wipro Technologies",
    contactPerson: "Vishal Agarwal",
    email: "vishal.agarwal@wipro.com",
    phone: "+91 98200 20006",
    address: "Wipro Campus, Sarjapur Road",
    city: "Bangalore",
    state: "Karnataka",
    discount: 20,
    contractStart: "2025-07-01T00:00:00Z",
    contractEnd: "2026-06-30T00:00:00Z",
    status: "expired",
    employeeCount: 18000,
    monthlyTests: 420,
    totalRevenue: 2100000,
    createdAt: "2025-06-10T00:00:00Z",
  },
]

export const corporateContracts: CorporateContract[] = [
  {
    id: "CONT001",
    corporateId: "CORP001",
    name: "TCS - Annual Health Checkup Plan 2025-26",
    testIds: ["PKG001", "PKG004", "PKG009"],
    packageIds: ["PKG001", "PKG004", "PKG009"],
    negotiatedPrice: 3499,
    discount: 25,
    startDate: "2025-01-01T00:00:00Z",
    endDate: "2026-12-31T00:00:00Z",
    status: "active",
  },
  {
    id: "CONT002",
    corporateId: "CORP002",
    name: "RIL - Executive Health Plan",
    testIds: ["PKG001", "PKG003", "PKG010"],
    packageIds: ["PKG001", "PKG003", "PKG010"],
    negotiatedPrice: 3999,
    discount: 20,
    startDate: "2025-03-01T00:00:00Z",
    endDate: "2026-08-31T00:00:00Z",
    status: "active",
  },
  {
    id: "CONT003",
    corporateId: "CORP003",
    name: "Infosys - Wellness Program 2025-26",
    testIds: ["PKG001", "PKG002", "PKG007"],
    packageIds: ["PKG001", "PKG002", "PKG007"],
    negotiatedPrice: 2999,
    discount: 22,
    startDate: "2025-06-01T00:00:00Z",
    endDate: "2026-11-30T00:00:00Z",
    status: "active",
  },
  {
    id: "CONT004",
    corporateId: "CORP004",
    name: "HDFC Bank - Employee Screening",
    testIds: ["PKG001", "PKG005"],
    packageIds: ["PKG001", "PKG005"],
    negotiatedPrice: 2599,
    discount: 18,
    startDate: "2025-09-01T00:00:00Z",
    endDate: "2026-09-30T00:00:00Z",
    status: "active",
  },
  {
    id: "CONT005",
    corporateId: "CORP005",
    name: "Apollo - Referral Partnership",
    testIds: ["PKG001", "PKG003", "PKG004", "PKG009", "PKG010"],
    packageIds: ["PKG001", "PKG003", "PKG004", "PKG009", "PKG010"],
    negotiatedPrice: 2799,
    discount: 30,
    startDate: "2025-04-01T00:00:00Z",
    endDate: "2027-03-31T00:00:00Z",
    status: "active",
  },
  {
    id: "CONT006",
    corporateId: "CORP006",
    name: "Wipro - Health Plan 2025-26",
    testIds: ["PKG001", "PKG010"],
    packageIds: ["PKG001", "PKG010"],
    negotiatedPrice: 3599,
    discount: 20,
    startDate: "2025-07-01T00:00:00Z",
    endDate: "2026-06-30T00:00:00Z",
    status: "expired",
  },
]
