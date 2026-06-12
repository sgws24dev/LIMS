export interface HCAgent {
  id: string
  name: string
  phone: string
  email: string
  vehicleType: "bike" | "scooter" | "car" | "van"
  area: string[]
  isActive: boolean
  totalCollections: number
  todayCollections: number
  rating: number
  createdAt: string
}

export interface HCRoute {
  id: string
  date: string
  agentId: string
  agentName: string
  bookingIds: string[]
  patientAddresses: { bookingId: string; address: string; patientName: string; timeSlot: string }[]
  status: "assigned" | "in_progress" | "completed" | "cancelled"
  estimatedDuration: number
  totalDistance: number
  startedAt?: string
  completedAt?: string
  notes?: string
}

export interface HCBooking {
  id: string
  bookingId: string
  patientName: string
  patientPhone: string
  address: string
  city: string
  pincode: string
  scheduledDate: string
  timeSlot: "morning" | "afternoon" | "evening"
  preferredTime?: string
  tests: string[]
  status: "pending" | "assigned" | "collected" | "completed" | "cancelled"
  agentId?: string
  agentName?: string
  specialInstructions?: string
  createdAt: string
}

export const homeCollectionAgents: HCAgent[] = [
  {
    id: "HCA001",
    name: "Rajesh Kumar",
    phone: "+91 98765 50001",
    email: "rajesh.kumar@lifsyslab.com",
    vehicleType: "bike",
    area: ["Andheri East", "Andheri West", "Juhu", "Vile Parle"],
    isActive: true,
    totalCollections: 1250,
    todayCollections: 6,
    rating: 4.8,
    createdAt: "2023-04-01T00:00:00Z",
  },
  {
    id: "HCA002",
    name: "Sunita Yadav",
    phone: "+91 98765 50002",
    email: "sunita.yadav@lifsyslab.com",
    vehicleType: "scooter",
    area: ["Banjara Hills", "Jubilee Hills", "Hitech City", "Madhapur"],
    isActive: true,
    totalCollections: 980,
    todayCollections: 4,
    rating: 4.6,
    createdAt: "2023-06-15T00:00:00Z",
  },
  {
    id: "HCA003",
    name: "Sandeep Nair",
    phone: "+91 98765 50003",
    email: "sandeep.nair@lifsyslab.com",
    vehicleType: "bike",
    area: ["Indira Nagar", "Koramangala", "MG Road", "Whitefield"],
    isActive: true,
    totalCollections: 1450,
    todayCollections: 7,
    rating: 4.9,
    createdAt: "2023-03-10T00:00:00Z",
  },
  {
    id: "HCA004",
    name: "Gaurav Pawar",
    phone: "+91 98765 50004",
    email: "gaurav.pawar@lifsyslab.com",
    vehicleType: "scooter",
    area: ["Connaught Place", "Karol Bagh", "Lajpat Nagar", "Saket"],
    isActive: true,
    totalCollections: 820,
    todayCollections: 3,
    rating: 4.5,
    createdAt: "2024-01-15T00:00:00Z",
  },
  {
    id: "HCA005",
    name: "Priya Nair",
    phone: "+91 98765 50005",
    email: "priya.nair@lifsyslab.com",
    vehicleType: "car",
    area: ["Powai", "Bandra", "Worli", "Colaba"],
    isActive: true,
    totalCollections: 650,
    todayCollections: 5,
    rating: 4.7,
    createdAt: "2024-04-20T00:00:00Z",
  },
  {
    id: "HCA006",
    name: "Venkatesh Iyer",
    phone: "+91 98765 50006",
    email: "venkatesh.iyer@lifsyslab.com",
    vehicleType: "van",
    area: ["T Nagar", "Adyar", "Velachery", "Thousand Lights"],
    isActive: true,
    totalCollections: 540,
    todayCollections: 4,
    rating: 4.4,
    createdAt: "2024-07-01T00:00:00Z",
  },
]

export const homeCollectionBookings: HCBooking[] = [
  {
    id: "HCB001",
    bookingId: "BKG006",
    patientName: "Sunita Verma",
    patientPhone: "+91 98100 10006",
    address: "12, Golf Links, Sector 15, Lucknow",
    city: "Lucknow",
    pincode: "226001",
    scheduledDate: "2026-06-03",
    timeSlot: "morning",
    preferredTime: "06:00",
    tests: ["RA Factor", "ESR", "CRP"],
    status: "completed",
    agentId: "HCA004",
    agentName: "Gaurav Pawar",
    createdAt: "2026-06-02T10:00:00Z",
  },
  {
    id: "HCB002",
    bookingId: "BKG022",
    patientName: "Venkatesh Reddy",
    patientPhone: "+91 98100 10003",
    address: "88, Jubilee Hills, Road No 12, Hyderabad",
    city: "Hyderabad",
    pincode: "500033",
    scheduledDate: "2026-05-15",
    timeSlot: "morning",
    preferredTime: "07:00",
    tests: ["TSH", "Vitamin D", "Vitamin B12"],
    status: "completed",
    agentId: "HCA002",
    agentName: "Sunita Yadav",
    specialInstructions: "Patient prefers early morning collection. Fasting required.",
    createdAt: "2026-05-14T09:00:00Z",
  },
  {
    id: "HCB003",
    bookingId: "BKG031",
    patientName: "Ritu Saxena",
    patientPhone: "+91 98100 10020",
    address: "14, Hiranandani Gardens, Powai, Mumbai",
    city: "Mumbai",
    pincode: "400076",
    scheduledDate: "2026-06-10",
    timeSlot: "morning",
    preferredTime: "08:00",
    tests: ["Prolactin", "LH", "FSH"],
    status: "assigned",
    agentId: "HCA005",
    agentName: "Priya Nair",
    specialInstructions: "Hormonal panel - collect in morning before 9 AM.",
    createdAt: "2026-06-09T15:00:00Z",
  },
  {
    id: "HCB004",
    bookingId: "BKG010",
    patientName: "Lakshmi Bhat",
    patientPhone: "+91 98100 10010",
    address: "22, Malleshwaram, 8th Cross, Bangalore",
    city: "Bangalore",
    pincode: "560003",
    scheduledDate: "2026-06-11",
    timeSlot: "morning",
    preferredTime: "07:30",
    tests: ["FBS", "HbA1c", "Lipid Profile", "Creatinine"],
    status: "pending",
    specialInstructions: "Fasting 10-12 hours required for lipid profile.",
    createdAt: "2026-06-10T14:00:00Z",
  },
  {
    id: "HCB005",
    bookingId: "BKG015",
    patientName: "Prakash Rao",
    patientPhone: "+91 98100 10015",
    address: "11, Sadashiv Peth, Tilak Road, Pune",
    city: "Pune",
    pincode: "411030",
    scheduledDate: "2026-06-12",
    timeSlot: "afternoon",
    preferredTime: "14:00",
    tests: ["CBC", "LFT", "KFT"],
    status: "pending",
    createdAt: "2026-06-10T11:00:00Z",
  },
  {
    id: "HCB006",
    bookingId: "BKG025",
    patientName: "Rajesh Sharma",
    patientPhone: "+91 98100 10001",
    address: "42, Model Town, Phase 2, Delhi",
    city: "Delhi",
    pincode: "110009",
    scheduledDate: "2026-06-11",
    timeSlot: "morning",
    preferredTime: "06:30",
    tests: ["CBC"],
    status: "assigned",
    agentId: "HCA004",
    agentName: "Gaurav Pawar",
    createdAt: "2026-06-10T08:00:00Z",
  },
]

export const hcRoutes: HCRoute[] = [
  {
    id: "HCR001",
    date: "2026-06-03",
    agentId: "HCA004",
    agentName: "Gaurav Pawar",
    bookingIds: ["BKG006"],
    patientAddresses: [
      { bookingId: "BKG006", address: "12, Golf Links, Sector 15, Lucknow", patientName: "Sunita Verma", timeSlot: "06:00" },
    ],
    status: "completed",
    estimatedDuration: 60,
    totalDistance: 12,
    startedAt: "2026-06-03T05:30:00Z",
    completedAt: "2026-06-03T07:00:00Z",
  },
  {
    id: "HCR002",
    date: "2026-05-15",
    agentId: "HCA002",
    agentName: "Sunita Yadav",
    bookingIds: ["BKG022"],
    patientAddresses: [
      { bookingId: "BKG022", address: "88, Jubilee Hills, Road No 12, Hyderabad", patientName: "Venkatesh Reddy", timeSlot: "07:00" },
    ],
    status: "completed",
    estimatedDuration: 45,
    totalDistance: 8,
    startedAt: "2026-05-15T06:30:00Z",
    completedAt: "2026-05-15T08:00:00Z",
  },
  {
    id: "HCR003",
    date: "2026-06-10",
    agentId: "HCA005",
    agentName: "Priya Nair",
    bookingIds: ["BKG031"],
    patientAddresses: [
      { bookingId: "BKG031", address: "14, Hiranandani Gardens, Powai, Mumbai", patientName: "Ritu Saxena", timeSlot: "08:00" },
    ],
    status: "assigned",
    estimatedDuration: 90,
    totalDistance: 15,
    startedAt: "2026-06-10T07:30:00Z",
    notes: "Traffic expected during morning rush hour",
  },
  {
    id: "HCR004",
    date: "2026-06-11",
    agentId: "HCA004",
    agentName: "Gaurav Pawar",
    bookingIds: ["BKG025"],
    patientAddresses: [
      { bookingId: "BKG025", address: "42, Model Town, Phase 2, Delhi", patientName: "Rajesh Sharma", timeSlot: "06:30" },
    ],
    status: "assigned",
    estimatedDuration: 120,
    totalDistance: 20,
  },
  {
    id: "HCR005",
    date: "2026-06-12",
    agentId: "HCA001",
    agentName: "Rajesh Kumar",
    bookingIds: [],
    patientAddresses: [],
    status: "assigned",
    estimatedDuration: 240,
    totalDistance: 35,
  },
]
