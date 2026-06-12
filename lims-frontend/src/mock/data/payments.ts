export type PaymentMethod = "cash" | "card" | "upi" | "cheque" | "insurance" | "bank_transfer"
export type PaymentStatus = "completed" | "pending" | "failed" | "refunded"

export interface Payment {
  id: string
  invoiceId: string
  invoiceNumber: string
  patientName: string
  amount: number
  method: PaymentMethod
  date: string
  reference: string
  status: PaymentStatus
}

export const payments: Payment[] = [
  { id: "PAY001", invoiceId: "INV001", invoiceNumber: "LSD-INV-2026-0001", patientName: "Rajesh Sharma", amount: 1350, method: "cash", date: "2026-06-01T08:00:00Z", reference: "CASH-0601-001", status: "completed" },
  { id: "PAY002", invoiceId: "INV002", invoiceNumber: "LSD-INV-2026-0002", patientName: "Anita Patel", amount: 500, method: "card", date: "2026-06-02T09:00:00Z", reference: "CARD-0602-001", status: "completed" },
  { id: "PAY003", invoiceId: "INV003", invoiceNumber: "LSD-INV-2026-0003", patientName: "Venkatesh Reddy", amount: 1674, method: "upi", date: "2026-06-01T07:30:00Z", reference: "UPI-PAY-001", status: "completed" },
  { id: "PAY004", invoiceId: "INV005", invoiceNumber: "LSD-INV-2026-0005", patientName: "Manoj Desai", amount: 810, method: "cash", date: "2026-06-05T07:00:00Z", reference: "CASH-0605-001", status: "completed" },
  { id: "PAY005", invoiceId: "INV006", invoiceNumber: "LSD-INV-2026-0006", patientName: "Sunita Verma", amount: 918, method: "card", date: "2026-06-03T10:00:00Z", reference: "CARD-0603-001", status: "completed" },
  { id: "PAY006", invoiceId: "INV007", invoiceNumber: "LSD-INV-2026-0007", patientName: "Arvind Nair", amount: 540, method: "cash", date: "2026-06-06T07:30:00Z", reference: "CASH-0606-001", status: "completed" },
  { id: "PAY007", invoiceId: "INV008", invoiceNumber: "LSD-INV-2026-0008", patientName: "Deepa Iyengar", amount: 1000, method: "upi", date: "2026-06-08T10:00:00Z", reference: "UPI-PAY-002", status: "completed" },
  { id: "PAY008", invoiceId: "INV009", invoiceNumber: "LSD-INV-2026-0009", patientName: "Lakshmi Bhat", amount: 1566, method: "cheque", date: "2026-06-05T09:00:00Z", reference: "CHQ-110245", status: "completed" },
  { id: "PAY009", invoiceId: "INV010", invoiceNumber: "LSD-INV-2026-0010", patientName: "Ravi Chaudhary", amount: 1296, method: "cash", date: "2026-06-04T08:00:00Z", reference: "CASH-0604-001", status: "completed" },
  { id: "PAY010", invoiceId: "INV011", invoiceNumber: "LSD-INV-2026-0011", patientName: "Dharmendra Singh", amount: 972, method: "card", date: "2026-06-09T08:00:00Z", reference: "CARD-0609-001", status: "completed" },
  { id: "PAY011", invoiceId: "INV012", invoiceNumber: "LSD-INV-2026-0012", patientName: "Shweta Agarwal", amount: 500, method: "cash", date: "2026-06-10T07:00:00Z", reference: "CASH-0610-001", status: "completed" },
  { id: "PAY012", invoiceId: "INV013", invoiceNumber: "LSD-INV-2026-0013", patientName: "Prakash Rao", amount: 1080, method: "upi", date: "2026-06-02T07:30:00Z", reference: "UPI-PAY-003", status: "completed" },
  { id: "PAY013", invoiceId: "INV014", invoiceNumber: "LSD-INV-2026-0014", patientName: "Nisha Jain", amount: 972, method: "cash", date: "2026-06-07T08:00:00Z", reference: "CASH-0607-001", status: "completed" },
  { id: "PAY014", invoiceId: "INV015", invoiceNumber: "LSD-INV-2026-0015", patientName: "Hariharan Nambiar", amount: 1080, method: "card", date: "2026-06-02T14:00:00Z", reference: "CARD-0602-002", status: "completed" },
  { id: "PAY015", invoiceId: "INV016", invoiceNumber: "LSD-INV-2026-0016", patientName: "Mohan Lal", amount: 1242, method: "insurance", date: "2026-06-03T09:00:00Z", reference: "INS-NIC-001", status: "completed" },
  { id: "PAY016", invoiceId: "INV017", invoiceNumber: "LSD-INV-2026-0017", patientName: "Ritu Saxena", amount: 1296, method: "upi", date: "2026-06-06T10:00:00Z", reference: "UPI-PAY-004", status: "completed" },
  { id: "PAY017", invoiceId: "INV020", invoiceNumber: "LSD-INV-2026-0020", patientName: "Rajesh Sharma", amount: 324, method: "cash", date: "2026-06-10T08:00:00Z", reference: "CASH-0610-002", status: "completed" },
  { id: "PAY018", invoiceId: "INV021", invoiceNumber: "LSD-INV-2026-0021", patientName: "Ritu Saxena", amount: 500, method: "cash", date: "2026-06-10T08:00:00Z", reference: "CASH-0610-003", status: "completed" },
  { id: "PAY019", invoiceId: "INV022", invoiceNumber: "LSD-INV-2026-0022", patientName: "Prakash Rao", amount: 2214, method: "insurance", date: "2026-05-05T09:30:00Z", reference: "INS-STAR-001", status: "completed" },
  { id: "PAY020", invoiceId: "INV004", invoiceNumber: "LSD-INV-2026-0004", patientName: "Priyanka Gupta", amount: 1566, method: "bank_transfer", date: "2026-06-11T11:00:00Z", reference: "NEFT-HDFC-001", status: "pending" },
  { id: "PAY021", invoiceId: "INV008", invoiceNumber: "LSD-INV-2026-0008", patientName: "Deepa Iyengar", amount: 944, method: "card", date: "2026-06-12T09:00:00Z", reference: "CARD-0612-001", status: "pending" },
  { id: "PAY022", invoiceId: "INV018", invoiceNumber: "LSD-INV-2026-0018", patientName: "Anita Patel", amount: 1727, method: "upi", date: "2026-06-12T10:00:00Z", reference: "UPI-PAY-005", status: "failed" },
]

export const getTodayCollections = (): Payment[] => {
  const today = "2026-06-11"
  return payments.filter((p) => p.date.startsWith(today) && p.status === "completed")
}

export const getPaymentMethodBreakdown = (): { method: string; amount: number; count: number }[] => {
  const map = new Map<string, { amount: number; count: number }>()
  payments.filter((p) => p.status === "completed").forEach((p) => {
    const existing = map.get(p.method) ?? { amount: 0, count: 0 }
    existing.amount += p.amount
    existing.count += 1
    map.set(p.method, existing)
  })
  return Array.from(map.entries()).map(([method, data]) => ({ method, ...data }))
}
