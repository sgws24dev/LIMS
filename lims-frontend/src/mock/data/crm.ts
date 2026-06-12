export interface Campaign {
  id: string
  name: string
  type: "health_camp" | "discount_offer" | "awareness" | "corporate_outreach" | "seasonal"
  channel: "sms" | "email" | "whatsapp" | "push" | "offline"
  audience: string
  targetCount: number
  reachedCount: number
  budget: number
  spent: number
  startDate: string
  endDate: string
  status: "draft" | "active" | "completed" | "cancelled"
  metrics: {
    opens: number
    clicks: number
    responses: number
    conversions: number
  }
  createdAt: string
}

export interface LoyaltyProgram {
  id: string
  name: string
  pointsPerRupee: number
  minRedemption: number
  maxRedemption: number
  expiryDays: number
  isActive: boolean
  enrolledCount: number
  createdAt: string
}

export interface Coupon {
  id: string
  code: string
  description: string
  discount: number
  type: "percentage" | "flat"
  minAmount: number
  maxDiscount: number
  usageLimit: number
  usedCount: number
  validFrom: string
  expiresAt: string
  isActive: boolean
}

export const campaigns: Campaign[] = [
  {
    id: "CMP001",
    name: "Summer Health Checkup Camp",
    type: "health_camp",
    channel: "sms",
    audience: "All registered patients in Mumbai & Pune",
    targetCount: 5000,
    reachedCount: 4850,
    budget: 50000,
    spent: 42500,
    startDate: "2026-04-01T00:00:00Z",
    endDate: "2026-06-30T00:00:00Z",
    status: "active",
    metrics: { opens: 3200, clicks: 1850, responses: 420, conversions: 185 },
    createdAt: "2026-03-20T00:00:00Z",
  },
  {
    id: "CMP002",
    name: "Diabetes Awareness Month",
    type: "awareness",
    channel: "whatsapp",
    audience: "Patients aged 40+ with diabetes risk factors",
    targetCount: 3000,
    reachedCount: 2900,
    budget: 25000,
    spent: 22000,
    startDate: "2026-05-01T00:00:00Z",
    endDate: "2026-06-15T00:00:00Z",
    status: "active",
    metrics: { opens: 2100, clicks: 980, responses: 210, conversions: 88 },
    createdAt: "2026-04-25T00:00:00Z",
  },
  {
    id: "CMP003",
    name: "Corporate Wellness Outreach",
    type: "corporate_outreach",
    channel: "email",
    audience: "HR heads of companies in Bangalore IT corridor",
    targetCount: 200,
    reachedCount: 185,
    budget: 15000,
    spent: 12000,
    startDate: "2026-05-15T00:00:00Z",
    endDate: "2026-07-31T00:00:00Z",
    status: "active",
    metrics: { opens: 142, clicks: 65, responses: 28, conversions: 8 },
    createdAt: "2026-05-10T00:00:00Z",
  },
  {
    id: "CMP004",
    name: "Monsoon Discount Offer",
    type: "discount_offer",
    channel: "sms",
    audience: "All existing patients",
    targetCount: 15000,
    reachedCount: 14800,
    budget: 80000,
    spent: 75000,
    startDate: "2026-06-01T00:00:00Z",
    endDate: "2026-07-15T00:00:00Z",
    status: "active",
    metrics: { opens: 8900, clicks: 4200, responses: 1100, conversions: 345 },
    createdAt: "2026-05-25T00:00:00Z",
  },
  {
    id: "CMP005",
    name: "Women's Health Camp - March 2026",
    type: "health_camp",
    channel: "offline",
    audience: "Women residents in Hyderabad",
    targetCount: 1000,
    reachedCount: 850,
    budget: 120000,
    spent: 118000,
    startDate: "2026-03-01T00:00:00Z",
    endDate: "2026-03-31T00:00:00Z",
    status: "completed",
    metrics: { opens: 0, clicks: 0, responses: 720, conversions: 320 },
    createdAt: "2026-02-15T00:00:00Z",
  },
  {
    id: "CMP006",
    name: "Senior Citizen Health Plan Launch",
    type: "seasonal",
    channel: "push",
    audience: "Patients aged 60+",
    targetCount: 2000,
    reachedCount: 1850,
    budget: 30000,
    spent: 28500,
    startDate: "2026-02-01T00:00:00Z",
    endDate: "2026-03-31T00:00:00Z",
    status: "completed",
    metrics: { opens: 1420, clicks: 680, responses: 195, conversions: 95 },
    createdAt: "2026-01-25T00:00:00Z",
  },
]

export const loyaltyPrograms: LoyaltyProgram[] = [
  {
    id: "LYL001",
    name: "Silver Membership",
    pointsPerRupee: 1,
    minRedemption: 500,
    maxRedemption: 5000,
    expiryDays: 365,
    isActive: true,
    enrolledCount: 12500,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "LYL002",
    name: "Gold Membership",
    pointsPerRupee: 2,
    minRedemption: 1000,
    maxRedemption: 10000,
    expiryDays: 365,
    isActive: true,
    enrolledCount: 5400,
    createdAt: "2024-06-01T00:00:00Z",
  },
  {
    id: "LYL003",
    name: "Platinum Membership",
    pointsPerRupee: 3,
    minRedemption: 2000,
    maxRedemption: 20000,
    expiryDays: 730,
    isActive: true,
    enrolledCount: 1850,
    createdAt: "2024-10-01T00:00:00Z",
  },
]

export const coupons: Coupon[] = [
  {
    id: "CPN001",
    code: "HEALTH50",
    description: "Flat ₹50 off on all tests above ₹500",
    discount: 50,
    type: "flat",
    minAmount: 500,
    maxDiscount: 50,
    usageLimit: 1000,
    usedCount: 342,
    validFrom: "2026-06-01T00:00:00Z",
    expiresAt: "2026-07-31T00:00:00Z",
    isActive: true,
  },
  {
    id: "CPN002",
    code: "MONSOON15",
    description: "15% off on all health packages",
    discount: 15,
    type: "percentage",
    minAmount: 1000,
    maxDiscount: 500,
    usageLimit: 500,
    usedCount: 128,
    validFrom: "2026-06-01T00:00:00Z",
    expiresAt: "2026-07-15T00:00:00Z",
    isActive: true,
  },
  {
    id: "CPN003",
    code: "SENIOR20",
    description: "20% off for senior citizens on all tests",
    discount: 20,
    type: "percentage",
    minAmount: 500,
    maxDiscount: 300,
    usageLimit: 300,
    usedCount: 45,
    validFrom: "2026-04-01T00:00:00Z",
    expiresAt: "2026-09-30T00:00:00Z",
    isActive: true,
  },
  {
    id: "CPN004",
    code: "WELCOME100",
    description: "₹100 off on first test booking",
    discount: 100,
    type: "flat",
    minAmount: 300,
    maxDiscount: 100,
    usageLimit: 2000,
    usedCount: 876,
    validFrom: "2026-01-01T00:00:00Z",
    expiresAt: "2026-12-31T00:00:00Z",
    isActive: true,
  },
  {
    id: "CPN005",
    code: "DIABETES25",
    description: "25% off on Diabetes Care Package",
    discount: 25,
    type: "percentage",
    minAmount: 1000,
    maxDiscount: 400,
    usageLimit: 200,
    usedCount: 62,
    validFrom: "2026-05-01T00:00:00Z",
    expiresAt: "2026-06-30T00:00:00Z",
    isActive: true,
  },
  {
    id: "CPN006",
    code: "FAMILY200",
    description: "₹200 off on family packages above ₹2000",
    discount: 200,
    type: "flat",
    minAmount: 2000,
    maxDiscount: 200,
    usageLimit: 150,
    usedCount: 150,
    validFrom: "2026-01-01T00:00:00Z",
    expiresAt: "2026-03-31T00:00:00Z",
    isActive: false,
  },
]
