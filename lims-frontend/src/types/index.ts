export type UserRole = "super_admin" | "lab_admin" | "branch_manager" | "technician" | "doctor" | "receptionist" | "phlebotomist" | "billing" | "patient" | "corporate"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  phone: string
  avatar?: string
  isActive: boolean
  branchId?: string
  tenantId: string
  createdAt: string
  lastLogin?: string
}

export interface Role {
  id: string
  name: string
  description: string
  permissions: Permission[]
  userCount: number
  createdAt: string
}

export interface Permission {
  module: string
  canView: boolean
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
}

export interface Patient {
  id: string
  name: string
  phone: string
  email: string
  dob: string
  gender: "male" | "female" | "other"
  bloodGroup: string
  address: string
  city: string
  state: string
  pincode: string
  avatar?: string
  medicalHistory: string[]
  familyMembers: FamilyMember[]
  attachments: Attachment[]
  visits: Visit[]
  createdAt: string
  updatedAt: string
}

export interface FamilyMember {
  id: string
  name: string
  relation: string
  phone: string
  dob: string
}

export interface Attachment {
  id: string
  name: string
  type: string
  url: string
  uploadedAt: string
  size: string
}

export interface Visit {
  id: string
  date: string
  type: string
  status: string
  doctor: string
  tests: string[]
  amount: number
}

export interface Doctor {
  id: string
  name: string
  email: string
  phone: string
  specialization: string
  hospital: string
  city: string
  commission: number
  patientsReferred: number
  totalRevenue: number
  isActive: boolean
  avatar?: string
  createdAt: string
}

export interface Branch {
  id: string
  name: string
  code: string
  address: string
  city: string
  state: string
  phone: string
  email: string
  isActive: boolean
  staffCount: number
  monthlyTests: number
  monthlyRevenue: number
  createdAt: string
}

export interface TestCategory {
  id: string
  name: string
  description: string
  testCount: number
  isActive: boolean
}

export interface Test {
  id: string
  name: string
  code: string
  category: string
  department: string
  price: number
  turnaroundTime: string
  parameters: TestParameter[]
  isActive: boolean
  preparation?: string
  reportFormat?: string
}

export interface TestParameter {
  id: string
  name: string
  unit: string
  referenceRange: string
  method: string
}

export interface TestPackage {
  id: string
  name: string
  code: string
  description: string
  tests: string[]
  price: number
  discountedPrice: number
  isActive: boolean
}

export interface Booking {
  id: string
  patientId: string
  patientName: string
  patientPhone: string
  tests: string[]
  totalAmount: number
  paidAmount: number
  status: "pending" | "registered" | "sample_collected" | "in_progress" | "completed" | "cancelled"
  type: "walkin" | "existing" | "corporate" | "insurance"
  branchId: string
  doctorId?: string
  collectionType: "lab" | "home"
  homeCollectionAddress?: string
  scheduledDate: string
  scheduledTime?: string
  createdAt: string
  barcode?: string
  notes?: string
}

export type SampleStatus = "registered" | "collected" | "received" | "processing" | "testing" | "validation" | "approved" | "delivered" | "rejected" | "disposed" | "re_testing" | "transferred" | "completed"

export interface Sample {
  id: string
  bookingId: string
  patientId?: string
  patientName: string
  patientPhone?: string
  testName: string
  testId?: string
  barcode: string
  type: string
  container?: string
  volume?: string
  status: SampleStatus
  collectedBy?: string
  collectedAt?: string
  receivedBy?: string
  receivedAt?: string
  processedBy?: string
  processedAt?: string
  testedBy?: string
  testedAt?: string
  validatedBy?: string
  validatedAt?: string
  approvedBy?: string
  approvedAt?: string
  deliveredAt?: string
  rejectedBy?: string
  rejectedAt?: string
  rejectedReason?: string
  rejectionCategory?: "clotted" | "haemolysed" | "insufficient" | "wrong_container" | "contaminated" | "expired" | "mislabeled" | "other"
  disposedBy?: string
  disposedAt?: string
  disposalReason?: string
  transferredTo?: string
  transferredAt?: string
  retestRequestedBy?: string
  retestRequestedAt?: string
  retestReason?: string
  parentSampleId?: string
  isAliquot?: boolean
  parentAliquotId?: string
  department?: string
  priority?: "routine" | "urgent" | "stat" | "today"
  notes?: string
  createdAt?: string
  updatedAt?: string
}

export interface SampleTimelineEvent {
  id: string
  sampleId: string
  status: SampleStatus
  performedBy: string
  timestamp: string
  notes?: string
}

export interface Aliquot {
  id: string
  parentSampleId: string
  barcode: string
  volume: string
  container: string
  createdBy: string
  createdAt: string
  usedFor: string
  status: "available" | "in_use" | "consumed" | "expired" | "disposed"
  expiryDate?: string
}

export interface SampleTransfer {
  id: string
  sampleId: string
  fromDepartment: string
  toDepartment: string
  fromBranch: string
  toBranch: string
  transferredBy: string
  transferredAt: string
  receivedBy?: string
  receivedAt?: string
  status: "in_transit" | "received" | "lost"
  notes?: string
}

export interface RetestRequest {
  id: string
  sampleId: string
  originalResultId: string
  requestedBy: string
  requestedAt: string
  reason: string
  status: "pending" | "approved" | "completed"
  approvedBy?: string
  approvedAt?: string
  newResultId?: string
}

export interface Result {
  id: string
  bookingId: string
  sampleId: string
  patientId?: string
  patientName: string
  patientAge?: number
  patientGender?: string
  testName: string
  testId?: string
  department?: string
  parameters: ResultParameter[]
  status: "draft" | "review" | "verified" | "validated" | "approved" | "published" | "amended"
  enteredBy: string
  enteredAt: string
  reviewedBy?: string
  reviewedAt?: string
  verifiedBy?: string
  verifiedAt?: string
  validatedBy?: string
  validatedAt?: string
  approvedBy?: string
  approvedAt?: string
  publishedAt?: string
  amendedBy?: string
  amendedAt?: string
  amendmentReason?: string
  isCritical: boolean
  isAbnormal?: boolean
  deltaCheck?: "normal" | "significant" | "critical" | "no_previous"
  previousResultId?: string
  previousValues?: { parameterName: string; previousValue: string; currentValue: string; change: number }[]
  notes?: string
  reportUrl?: string
  qrCode?: string
  pathologistComments?: string
  reviewedByPathologist?: boolean
  pathologistReviewedAt?: string
}

export interface ResultParameter {
  parameterId: string
  parameterName: string
  value: string
  unit: string
  referenceRange: string
  referenceLow?: number
  referenceHigh?: number
  isAbnormal: boolean
  isCritical: boolean
  method?: string
  instrumentId?: string
}

export interface CriticalAlert {
  id: string
  resultId: string
  patientId: string
  patientName: string
  parameterName: string
  value: string
  unit: string
  referenceRange: string
  notifiedTo: string
  notifiedAt: string
  acknowledgedBy?: string
  acknowledgedAt?: string
  status: "pending" | "notified" | "acknowledged" | "escalated"
}

export interface PathologistReview {
  id: string
  resultId: string
  sampleId: string
  patientName: string
  testName: string
  reviewerId: string
  reviewerName: string
  reviewedAt: string
  status: "pending" | "approved" | "rejected" | "amend_requested"
  comments: PathologistComment[]
  digitalSignature?: string
  signatureDate?: string
}

export interface PathologistComment {
  id: string
  author: string
  text: string
  createdAt: string
  isInternal: boolean
}

export interface ReportTemplate {
  id: string
  name: string
  description: string
  logoUrl?: string
  headerColor: string
  fontFamily: string
  showQR: boolean
  showPatientSummary: boolean
  showAIInterpretation: boolean
  footer: string
  isDefault: boolean
}

export interface SharedReport {
  id: string
  resultId: string
  shareLink: string
  sharedWith: string[]
  sharedAt: string
  expiresAt: string
  accessCount: number
  status: "active" | "expired" | "revoked"
}

export interface Instrument {
  id: string
  name: string
  model: string
  manufacturer: string
  serialNumber: string
  branchId: string
  department?: string
  status: "online" | "offline" | "maintenance" | "error" | "calibrating" | "idle"
  lastCalibration: string
  nextCalibration: string
  lastMaintenance?: string
  nextMaintenance?: string
  connectedTests: string[]
  ipAddress: string
  port: number
  isActive: boolean
  connectionType?: "lis" | "astm" | "hl7" | "manual"
  firmware?: string
  location?: string
}

export interface InstrumentLog {
  id: string
  instrumentId: string
  type: "info" | "warning" | "error" | "debug"
  message: string
  details?: string
  timestamp: string
  resolvedAt?: string
  resolvedBy?: string
}

export interface InstrumentError {
  id: string
  instrumentId: string
  errorCode: string
  errorMessage: string
  severity: "low" | "medium" | "high" | "critical"
  occurredAt: string
  resolvedAt?: string
  resolvedBy?: string
  notes?: string
}

export interface QCRecord {
  id: string
  testName: string
  testId: string
  lotNumber: string
  level: "L1" | "L2" | "L3"
  value: number
  mean: number
  sd: number
  result: "in_control" | "warning" | "out_of_control" | "violation"
  westgardRule?: string
  instrumentId: string
  performedBy: string
  performedAt: string
  notes?: string
}

export interface WestgardViolation {
  id: string
  rule: string
  description: string
  severity: "warning" | "out_of_control"
  qcRecordIds: string[]
  detectedAt: string
  resolvedAt?: string
  resolvedBy?: string
  action?: string
}

export interface CalibrationRecord {
  id: string
  instrumentId: string
  instrumentName: string
  calibratedBy: string
  calibratedAt: string
  nextCalibrationDue: string
  standardUsed: string
  results: { parameter: string; expected: number; observed: number; deviation: number; pass: boolean }[]
  status: "pass" | "fail" | "conditional"
  notes?: string
}

export interface MaintenanceRecord {
  id: string
  instrumentId: string
  instrumentName: string
  type: "preventive" | "corrective" | "emergency"
  performedBy: string
  performedAt: string
  completedAt?: string
  description: string
  partsReplaced?: string[]
  cost: number
  status: "scheduled" | "in_progress" | "completed" | "cancelled"
  nextMaintenanceDue?: string
  notes?: string
}

export interface WorkloadMetrics {
  department: string
  totalSamples: number
  pendingSamples: number
  completedSamples: number
  avgTurnaroundMinutes: number
  criticalSamples: number
  retestRequired: number
  technicianLoad: { name: string; assigned: number; completed: number; pending: number }[]
}

export interface DepartmentDashboard {
  department: string
  testsToday: number
  pendingTests: number
  completedTests: number
  avgTAT: number
  criticalCount: number
  staffOnline: number
  staffTotal: number
}

export interface Agent {
  id: string
  agentId?: string
  name: string
  phone: string
  email: string
  vehicleType: "bike" | "car" | "van"
  vehicleNumber: string
  status: "available" | "on_route" | "on_site" | "break" | "offline"
  currentLatitude?: number
  currentLongitude?: number
  todayCompleted: number
  todayAssigned: number
  rating: number
  branchId: string
}

export interface HCRoute {
  id: string
  agentId: string
  date: string
  bookings: string[]
  startTime: string
  estimatedEndTime: string
  actualEndTime?: string
  totalDistance: number
  status: "planned" | "in_progress" | "completed" | "cancelled"
  startLatitude?: number
  startLongitude?: number
  stops: { bookingId: string; address: string; latitude: number; longitude: number; status: "pending" | "visited" | "missed"; visitedAt?: string }[]
}

export interface HCVisit {
  id: string
  bookingId: string
  agentId: string
  patientName: string
  patientAddress: string
  patientPhone: string
  scheduledTime: string
  actualArrival?: string
  actualDeparture?: string
  status: "scheduled" | "en_route" | "arrived" | "in_progress" | "completed" | "missed" | "cancelled"
  samplesCollected: number
  paymentCollected: number
  notes?: string
  rating?: number
  feedback?: string
}

export interface Invoice {
  id: string
  invoiceNumber: string
  patientName: string
  patientId: string
  items: InvoiceItem[]
  subtotal: number
  discount: number
  tax: number
  total: number
  paid: number
  due: number
  status: "paid" | "partial" | "unpaid" | "cancelled"
  paymentMethod?: string
  paymentDate?: string
  dueDate: string
  createdAt: string
  notes?: string
}

export interface InvoiceItem {
  id: string
  name: string
  quantity: number
  unitPrice: number
  total: number
}

export interface InventoryItem {
  id: string
  name: string
  category: "reagent" | "consumable" | "equipment"
  sku: string
  quantity: number
  unit: string
  minQuantity: number
  maxQuantity: number
  batchNo?: string
  expiryDate?: string
  vendorId?: string
  price: number
  location: string
  isActive: boolean
}

export interface Notification {
  id: string
  type: "email" | "sms" | "whatsapp" | "push"
  title: string
  message: string
  recipients: string[]
  status: "sent" | "pending" | "failed"
  sentAt: string
  readBy: string[]
}

export interface Tenant {
  id: string
  name: string
  domain: string
  plan: "trial" | "basic" | "professional" | "enterprise"
  status: "active" | "suspended" | "cancelled"
  usersCount: number
  storageUsed: number
  subscriptionEnds: string
  createdAt: string
}

export interface AnalyticsData {
  revenue: { month: string; amount: number }[]
  patients: { month: string; count: number }[]
  tests: { month: string; count: number }[]
  turnaround: { department: string; avgHours: number }[]
  branchPerformance: { branch: string; revenue: number; tests: number }[]
  doctorReferrals: { doctor: string; count: number; revenue: number }[]
}
