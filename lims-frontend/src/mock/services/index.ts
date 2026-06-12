import { delay, generateId } from "@/lib/utils"
import type {
  User, Patient, Doctor, Branch, TestCategory, Test, TestPackage,
  Booking, Sample, Result, Instrument, InventoryItem, Invoice,
  Notification, AnalyticsData, Role, Tenant,
} from "@/types"
import { users } from "@/mock/data/users"
import { patients } from "@/mock/data/patients"
import { doctors } from "@/mock/data/doctors"
import { branches } from "@/mock/data/branches"
import { testCategories, tests, testPackages } from "@/mock/data/tests"
import { bookings } from "@/mock/data/bookings"
import { samples } from "@/mock/data/samples"
import { results } from "@/mock/data/results"
import { instruments } from "@/mock/data/instruments"
import { inventory, getLowStockItems, getExpiringItems } from "@/mock/data/inventory"
import { invoices } from "@/mock/data/invoices"
import { notifications } from "@/mock/data/notifications"
import { analytics } from "@/mock/data/analytics"
import { roles } from "@/mock/data/roles"
import { tenants } from "@/mock/data/tenants"
import { corporateAccounts, corporateContracts } from "@/mock/data/corporate"
import type { CorporateAccount, CorporateContract } from "@/mock/data/corporate"
import { campaigns, loyaltyPrograms, coupons } from "@/mock/data/crm"
import type { Campaign, LoyaltyProgram, Coupon } from "@/mock/data/crm"
import { qcRecords, calibrationRecords } from "@/mock/data/quality-control"
import type { QCRecord, CalibrationRecord } from "@/mock/data/quality-control"
import { homeCollectionAgents, homeCollectionBookings, hcRoutes } from "@/mock/data/home-collection"
import type { HCAgent, HCBooking, HCRoute } from "@/mock/data/home-collection"
import { samplesExtended } from "@/mock/data/samples-extended"
import { aliquots } from "@/mock/data/aliquots"
import { sampleTransfers } from "@/mock/data/sample-transfers"
import { retestRequests } from "@/mock/data/retest-requests"
import { criticalAlerts } from "@/mock/data/critical-alerts"
import { pathologistReviews } from "@/mock/data/pathologist-reviews"
import { reportTemplates } from "@/mock/data/report-templates"
import { sharedReports } from "@/mock/data/shared-reports"
import { instrumentLogs, instrumentErrors, maintenanceRecords, calibrationRecordsExt } from "@/mock/data/instruments-extended"
import { qcRecords as qcRecordsNew, westgardViolations, qcAlerts } from "@/mock/data/qc-data"
import { agents, hcRoutes as hcRoutesNew, hcVisits } from "@/mock/data/home-collection-extended"
import { workloadMetrics, departmentDashboards } from "@/mock/data/workload-data"
import { vendors, type Vendor } from "@/mock/data/vendors"
import { revenueTrend, tatData, sampleVolumeTrend, doctorReferrals as drReferrals, branchPerformance as brPerformance, inventoryHealth, outstandingPayments, pendingReports } from "@/mock/data/executive-data"
import type { Aliquot, SampleTransfer, RetestRequest, CriticalAlert, PathologistReview, ReportTemplate, SharedReport, InstrumentLog, InstrumentError, MaintenanceRecord, WestgardViolation, Agent, HCRoute as HCRouteT, HCVisit, WorkloadMetrics, DepartmentDashboard, ResultParameter, PathologistComment } from "@/types"
import type { CalibrationRecord as CalibrationRecordT, QCRecord as QCRecordT } from "@/types"

interface PaginationParams {
  page?: number
  limit?: number
}

interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

function paginate<T>(items: T[], params: PaginationParams): PaginatedResult<T> {
  const page = params.page ?? 1
  const limit = params.limit ?? 20
  const start = (page - 1) * limit
  const data = items.slice(start, start + limit)
  return {
    data,
    total: items.length,
    page,
    limit,
    totalPages: Math.ceil(items.length / limit),
  }
}

function filterBySearch<T>(items: T[], search?: string): T[] {
  if (!search) return items
  const q = search.toLowerCase()
  return items.filter((item) =>
    Object.values(item as Record<string, unknown>).some((v) =>
      String(v).toLowerCase().includes(q)
    )
  )
}

// Auth
export async function loginUser(email: string, password: string): Promise<{ user: User; token: string }> {
  await delay(500)
  const user = users.find((u) => u.email === email)
  if (!user) throw new Error("Invalid email or password")
  return { user, token: "mock-jwt-token-" + user.id }
}

export async function getCurrentUser(): Promise<User> {
  await delay(300)
  return users[0]
}

// Users
export async function getUsers(params: PaginationParams & { search?: string; role?: string; branchId?: string } = {}): Promise<PaginatedResult<User>> {
  await delay(400)
  let filtered = [...users]
  if (params.search) filtered = filterBySearch(filtered, params.search)
  if (params.role) filtered = filtered.filter((u) => u.role === params.role)
  if (params.branchId) filtered = filtered.filter((u) => u.branchId === params.branchId)
  return paginate(filtered, params)
}

export async function getUserById(id: string): Promise<User | undefined> {
  await delay(300)
  return users.find((u) => u.id === id)
}

export async function createUser(data: Omit<User, "id" | "createdAt" | "lastLogin">): Promise<User> {
  await delay(500)
  const user: User = { ...data, id: "USR" + String(users.length + 1).padStart(3, "0"), createdAt: new Date().toISOString() }
  users.push(user)
  return user
}

export async function updateUser(id: string, data: Partial<User>): Promise<User> {
  await delay(400)
  const idx = users.findIndex((u) => u.id === id)
  if (idx === -1) throw new Error("User not found")
  users[idx] = { ...users[idx], ...data }
  return users[idx]
}

export async function deleteUser(id: string): Promise<void> {
  await delay(400)
  const idx = users.findIndex((u) => u.id === id)
  if (idx !== -1) users.splice(idx, 1)
}

export async function bulkDeleteUsers(ids: string[]): Promise<void> {
  await delay(500)
  ids.forEach((id) => {
    const idx = users.findIndex((u) => u.id === id)
    if (idx !== -1) users.splice(idx, 1)
  })
}

// Patients
export async function getPatients(params: PaginationParams & { search?: string; city?: string; gender?: string } = {}): Promise<PaginatedResult<Patient>> {
  await delay(500)
  let filtered = [...patients]
  if (params.search) filtered = filterBySearch(filtered, params.search)
  if (params.city) filtered = filtered.filter((p) => p.city.toLowerCase() === params.city!.toLowerCase())
  if (params.gender) filtered = filtered.filter((p) => p.gender === params.gender)
  return paginate(filtered, params)
}

export async function getPatientById(id: string): Promise<Patient | undefined> {
  await delay(300)
  return patients.find((p) => p.id === id)
}

export async function createPatient(data: Omit<Patient, "id" | "createdAt" | "updatedAt">): Promise<Patient> {
  await delay(600)
  const now = new Date().toISOString()
  const patient: Patient = { ...data, id: "PAT" + String(patients.length + 1).padStart(3, "0"), createdAt: now, updatedAt: now }
  patients.push(patient)
  return patient
}

export async function updatePatient(id: string, data: Partial<Patient>): Promise<Patient> {
  await delay(400)
  const idx = patients.findIndex((p) => p.id === id)
  if (idx === -1) throw new Error("Patient not found")
  patients[idx] = { ...patients[idx], ...data, updatedAt: new Date().toISOString() }
  return patients[idx]
}

export async function deletePatient(id: string): Promise<void> {
  await delay(400)
  const idx = patients.findIndex((p) => p.id === id)
  if (idx !== -1) patients.splice(idx, 1)
}

export async function bulkDeletePatients(ids: string[]): Promise<void> {
  await delay(500)
  ids.forEach((id) => {
    const idx = patients.findIndex((p) => p.id === id)
    if (idx !== -1) patients.splice(idx, 1)
  })
}

// Doctors
export async function getDoctors(params: PaginationParams & { search?: string; specialization?: string } = {}): Promise<PaginatedResult<Doctor>> {
  await delay(400)
  let filtered = [...doctors]
  if (params.search) filtered = filterBySearch(filtered, params.search)
  if (params.specialization) filtered = filtered.filter((d) => d.specialization.toLowerCase().includes(params.specialization!.toLowerCase()))
  return paginate(filtered, params)
}

export async function getDoctorById(id: string): Promise<Doctor | undefined> {
  await delay(200)
  return doctors.find((d) => d.id === id)
}

export async function createDoctor(data: Omit<Doctor, "id" | "createdAt">): Promise<Doctor> {
  await delay(500)
  const doctor: Doctor = { ...data, id: "DOC" + String(doctors.length + 1).padStart(3, "0"), createdAt: new Date().toISOString() }
  doctors.push(doctor)
  return doctor
}

export async function updateDoctor(id: string, data: Partial<Doctor>): Promise<Doctor> {
  await delay(400)
  const idx = doctors.findIndex((d) => d.id === id)
  if (idx === -1) throw new Error("Doctor not found")
  doctors[idx] = { ...doctors[idx], ...data }
  return doctors[idx]
}

export async function deleteDoctor(id: string): Promise<void> {
  await delay(400)
  const idx = doctors.findIndex((d) => d.id === id)
  if (idx !== -1) doctors.splice(idx, 1)
}

export async function bulkDeleteDoctors(ids: string[]): Promise<void> {
  await delay(500)
  ids.forEach((id) => {
    const idx = doctors.findIndex((d) => d.id === id)
    if (idx !== -1) doctors.splice(idx, 1)
  })
}

// Branches
export async function getBranches(params: { search?: string; city?: string } = {}): Promise<Branch[]> {
  await delay(300)
  let filtered = [...branches]
  if (params.search) filtered = filterBySearch(filtered, params.search)
  if (params.city) filtered = filtered.filter((b) => b.city.toLowerCase() === params.city!.toLowerCase())
  return filtered
}

export async function getBranchById(id: string): Promise<Branch | undefined> {
  await delay(200)
  return branches.find((b) => b.id === id)
}

export async function createBranch(data: Omit<Branch, "id" | "createdAt">): Promise<Branch> {
  await delay(500)
  const branch: Branch = { ...data, id: "BR" + String(branches.length + 1).padStart(3, "0"), createdAt: new Date().toISOString() }
  branches.push(branch)
  return branch
}

export async function updateBranch(id: string, data: Partial<Branch>): Promise<Branch> {
  await delay(400)
  const idx = branches.findIndex((b) => b.id === id)
  if (idx === -1) throw new Error("Branch not found")
  branches[idx] = { ...branches[idx], ...data }
  return branches[idx]
}

export async function deleteBranch(id: string): Promise<void> {
  await delay(400)
  const idx = branches.findIndex((b) => b.id === id)
  if (idx !== -1) branches.splice(idx, 1)
}

// Tests
export async function getTestCategories(): Promise<TestCategory[]> {
  await delay(300)
  return testCategories
}

export async function createTestCategory(data: Omit<TestCategory, "id">): Promise<TestCategory> {
  await delay(400)
  const cat: TestCategory = { ...data, id: "TC" + String(testCategories.length + 1).padStart(3, "0") }
  testCategories.push(cat)
  return cat
}

export async function updateTestCategory(id: string, data: Partial<TestCategory>): Promise<TestCategory> {
  await delay(300)
  const idx = testCategories.findIndex((c) => c.id === id)
  if (idx === -1) throw new Error("Category not found")
  testCategories[idx] = { ...testCategories[idx], ...data }
  return testCategories[idx]
}

export async function deleteTestCategory(id: string): Promise<void> {
  await delay(300)
  const idx = testCategories.findIndex((c) => c.id === id)
  if (idx !== -1) testCategories.splice(idx, 1)
}

export async function getTests(params: PaginationParams & { search?: string; category?: string; department?: string } = {}): Promise<PaginatedResult<Test>> {
  await delay(400)
  let filtered = [...tests]
  if (params.search) filtered = filterBySearch(filtered, params.search)
  if (params.category) filtered = filtered.filter((t) => t.category === params.category)
  if (params.department) filtered = filtered.filter((t) => t.department === params.department)
  return paginate(filtered, params)
}

export async function getTestById(id: string): Promise<Test | undefined> {
  await delay(200)
  return tests.find((t) => t.id === id)
}

export async function createTest(data: Omit<Test, "id">): Promise<Test> {
  await delay(500)
  const test: Test = { ...data, id: "TST" + String(tests.length + 1).padStart(3, "0") }
  tests.push(test)
  return test
}

export async function updateTest(id: string, data: Partial<Test>): Promise<Test> {
  await delay(400)
  const idx = tests.findIndex((t) => t.id === id)
  if (idx === -1) throw new Error("Test not found")
  tests[idx] = { ...tests[idx], ...data }
  return tests[idx]
}

export async function deleteTest(id: string): Promise<void> {
  await delay(400)
  const idx = tests.findIndex((t) => t.id === id)
  if (idx !== -1) tests.splice(idx, 1)
}

export async function getTestPackages(): Promise<TestPackage[]> {
  await delay(300)
  return testPackages
}

export async function getTestPackageById(id: string): Promise<TestPackage | undefined> {
  await delay(200)
  return testPackages.find((p) => p.id === id)
}

export async function createTestPackage(data: Omit<TestPackage, "id">): Promise<TestPackage> {
  await delay(500)
  const pkg: TestPackage = { ...data, id: "PKG" + String(testPackages.length + 1).padStart(3, "0") }
  testPackages.push(pkg)
  return pkg
}

export async function updateTestPackage(id: string, data: Partial<TestPackage>): Promise<TestPackage> {
  await delay(400)
  const idx = testPackages.findIndex((p) => p.id === id)
  if (idx === -1) throw new Error("Package not found")
  testPackages[idx] = { ...testPackages[idx], ...data }
  return testPackages[idx]
}

export async function deleteTestPackage(id: string): Promise<void> {
  await delay(400)
  const idx = testPackages.findIndex((p) => p.id === id)
  if (idx !== -1) testPackages.splice(idx, 1)
}

// Bookings
export async function getBookings(params: PaginationParams & { search?: string; status?: string; type?: string; branchId?: string; dateFrom?: string; dateTo?: string } = {}): Promise<PaginatedResult<Booking>> {
  await delay(500)
  let filtered = [...bookings]
  if (params.search) filtered = filterBySearch(filtered, params.search)
  if (params.status) filtered = filtered.filter((b) => b.status === params.status)
  if (params.type) filtered = filtered.filter((b) => b.type === params.type)
  if (params.branchId) filtered = filtered.filter((b) => b.branchId === params.branchId)
  if (params.dateFrom) filtered = filtered.filter((b) => b.scheduledDate >= params.dateFrom!)
  if (params.dateTo) filtered = filtered.filter((b) => b.scheduledDate <= params.dateTo!)
  return paginate(filtered, params)
}

export async function getBookingById(id: string): Promise<Booking | undefined> {
  await delay(200)
  return bookings.find((b) => b.id === id)
}

export async function createBooking(data: Omit<Booking, "id" | "createdAt" | "barcode">): Promise<Booking> {
  await delay(600)
  const branch = branches.find((b) => b.id === data.branchId)
  const barcode = `${branch?.code ?? "LSD"}-${new Date().getFullYear()}-${String(bookings.length + 1).padStart(4, "0")}`
  const booking: Booking = { ...data, id: "BKG" + String(bookings.length + 1).padStart(3, "0"), barcode, createdAt: new Date().toISOString() }
  bookings.push(booking)
  return booking
}

export async function updateBookingStatus(id: string, status: Booking["status"]): Promise<Booking> {
  await delay(300)
  const idx = bookings.findIndex((b) => b.id === id)
  if (idx === -1) throw new Error("Booking not found")
  bookings[idx] = { ...bookings[idx], status }
  return bookings[idx]
}

// Samples
export async function getSamples(params: PaginationParams & { search?: string; status?: string; bookingId?: string } = {}): Promise<PaginatedResult<Sample>> {
  await delay(400)
  let filtered = [...samples]
  if (params.search) filtered = filterBySearch(filtered, params.search)
  if (params.status) filtered = filtered.filter((s) => s.status === params.status)
  if (params.bookingId) filtered = filtered.filter((s) => s.bookingId === params.bookingId)
  return paginate(filtered, params)
}

export async function createSample(data: Omit<Sample, "id">): Promise<Sample> {
  await delay(500)
  const sample: Sample = { ...data, id: "SMP" + String(samples.length + 1).padStart(3, "0") }
  samples.push(sample)
  return sample
}

export async function updateSampleStatus(id: string, status: Sample["status"], extra?: Partial<Sample>): Promise<Sample> {
  await delay(300)
  const idx = samples.findIndex((s) => s.id === id)
  if (idx === -1) throw new Error("Sample not found")
  samples[idx] = { ...samples[idx], status, ...extra }
  return samples[idx]
}

// Results
export async function getResults(params: PaginationParams & { search?: string; status?: string; isCritical?: boolean } = {}): Promise<PaginatedResult<Result>> {
  await delay(500)
  let filtered = [...results]
  if (params.search) filtered = filterBySearch(filtered, params.search)
  if (params.status) filtered = filtered.filter((r) => r.status === params.status)
  if (params.isCritical !== undefined) filtered = filtered.filter((r) => r.isCritical === params.isCritical)
  return paginate(filtered, params)
}

export async function getResultById(id: string): Promise<Result | undefined> {
  await delay(200)
  return results.find((r) => r.id === id)
}

export async function getResultsByBookingId(bookingId: string): Promise<Result[]> {
  await delay(300)
  return results.filter((r) => r.bookingId === bookingId)
}

export async function createResult(data: Omit<Result, "id" | "enteredAt">): Promise<Result> {
  await delay(500)
  const result: Result = { ...data, id: "RES" + String(results.length + 1).padStart(3, "0"), enteredAt: new Date().toISOString() }
  results.push(result)
  return result
}

export async function updateResultStatus(id: string, status: Result["status"], extra?: Partial<Result>): Promise<Result> {
  await delay(400)
  const idx = results.findIndex((r) => r.id === id)
  if (idx === -1) throw new Error("Result not found")
  const now = new Date().toISOString()
  const timestamps: Partial<Result> = {}
  if (status === "review") timestamps.reviewedAt = now
  if (status === "approved") timestamps.approvedAt = now
  results[idx] = { ...results[idx], status, ...timestamps, ...extra }
  return results[idx]
}

// Instruments
export async function getInstruments(params: { search?: string; status?: string; branchId?: string } = {}): Promise<Instrument[]> {
  await delay(300)
  let filtered = [...instruments]
  if (params.search) filtered = filterBySearch(filtered, params.search)
  if (params.status) filtered = filtered.filter((i) => i.status === params.status)
  if (params.branchId) filtered = filtered.filter((i) => i.branchId === params.branchId)
  return filtered
}

export async function getInstrumentById(id: string): Promise<Instrument | undefined> {
  await delay(200)
  return instruments.find((i) => i.id === id)
}

export async function createInstrument(data: Omit<Instrument, "id">): Promise<Instrument> {
  await delay(500)
  const instrument: Instrument = { ...data, id: "INS" + String(instruments.length + 1).padStart(3, "0") }
  instruments.push(instrument)
  return instrument
}

export async function updateInstrument(id: string, data: Partial<Instrument>): Promise<Instrument> {
  await delay(400)
  const idx = instruments.findIndex((i) => i.id === id)
  if (idx === -1) throw new Error("Instrument not found")
  instruments[idx] = { ...instruments[idx], ...data }
  return instruments[idx]
}

export async function deleteInstrument(id: string): Promise<void> {
  await delay(400)
  const idx = instruments.findIndex((i) => i.id === id)
  if (idx !== -1) instruments.splice(idx, 1)
}

export async function bulkDeleteInstruments(ids: string[]): Promise<void> {
  await delay(500)
  ids.forEach((id) => {
    const idx = instruments.findIndex((i) => i.id === id)
    if (idx !== -1) instruments.splice(idx, 1)
  })
}

// Inventory
export async function getInventory(params: PaginationParams & { search?: string; category?: string; lowStock?: boolean } = {}): Promise<PaginatedResult<InventoryItem>> {
  await delay(400)
  let filtered = [...inventory]
  if (params.lowStock) filtered = getLowStockItems()
  if (params.search) filtered = filterBySearch(filtered, params.search)
  if (params.category) filtered = filtered.filter((i) => i.category === params.category)
  return paginate(filtered, params)
}

export async function getLowStock(): Promise<InventoryItem[]> {
  await delay(200)
  return getLowStockItems()
}

export async function getExpiring(days = 90): Promise<InventoryItem[]> {
  await delay(200)
  return getExpiringItems(days)
}

export async function createInventoryItem(data: Omit<InventoryItem, "id">): Promise<InventoryItem> {
  await delay(500)
  const item: InventoryItem = { ...data, id: "INV" + String(inventory.length + 1).padStart(3, "0") }
  inventory.push(item)
  return item
}

export async function updateInventoryItem(id: string, data: Partial<InventoryItem>): Promise<InventoryItem> {
  await delay(300)
  const idx = inventory.findIndex((i) => i.id === id)
  if (idx === -1) throw new Error("Item not found")
  inventory[idx] = { ...inventory[idx], ...data }
  return inventory[idx]
}

export async function deleteInventoryItem(id: string): Promise<void> {
  await delay(400)
  const idx = inventory.findIndex((i) => i.id === id)
  if (idx !== -1) inventory.splice(idx, 1)
}

export async function bulkDeleteInventoryItems(ids: string[]): Promise<void> {
  await delay(500)
  ids.forEach((id) => {
    const idx = inventory.findIndex((i) => i.id === id)
    if (idx !== -1) inventory.splice(idx, 1)
  })
}

// Invoices
export async function getInvoices(params: PaginationParams & { search?: string; status?: string } = {}): Promise<PaginatedResult<Invoice>> {
  await delay(400)
  let filtered = [...invoices]
  if (params.search) filtered = filterBySearch(filtered, params.search)
  if (params.status) filtered = filtered.filter((inv) => inv.status === params.status)
  return paginate(filtered, params)
}

export async function getInvoiceById(id: string): Promise<Invoice | undefined> {
  await delay(200)
  return invoices.find((inv) => inv.id === id)
}

export async function createInvoice(data: Omit<Invoice, "id" | "invoiceNumber" | "createdAt">): Promise<Invoice> {
  await delay(500)
  const num = String(invoices.length + 1).padStart(4, "0")
  const invoice: Invoice = { ...data, id: "INV" + num, invoiceNumber: `LSD-INV-2026-${num}`, createdAt: new Date().toISOString() }
  invoices.push(invoice)
  return invoice
}

export async function bulkDeleteInvoices(ids: string[]): Promise<void> {
  await delay(500)
  ids.forEach((id) => {
    const idx = invoices.findIndex((i) => i.id === id)
    if (idx !== -1) invoices.splice(idx, 1)
  })
}

// Notifications
export async function getNotifications(params: { status?: string; type?: string; limit?: number } = {}): Promise<Notification[]> {
  await delay(300)
  let filtered = [...notifications]
  if (params.status) filtered = filtered.filter((n) => n.status === params.status)
  if (params.type) filtered = filtered.filter((n) => n.type === params.type)
  if (params.limit) filtered = filtered.slice(0, params.limit)
  return filtered
}

export async function markNotificationRead(id: string, userId: string): Promise<Notification> {
  await delay(200)
  const idx = notifications.findIndex((n) => n.id === id)
  if (idx === -1) throw new Error("Notification not found")
  if (!notifications[idx].readBy.includes(userId)) {
    notifications[idx].readBy.push(userId)
  }
  return notifications[idx]
}

// Analytics
export async function getAnalytics(): Promise<AnalyticsData> {
  await delay(500)
  return analytics
}

export async function getRevenueTrend(): Promise<AnalyticsData["revenue"]> {
  await delay(300)
  return analytics.revenue
}

export async function getPatientTrend(): Promise<AnalyticsData["patients"]> {
  await delay(300)
  return analytics.patients
}

export async function getTestTrend(): Promise<AnalyticsData["tests"]> {
  await delay(300)
  return analytics.tests
}

export async function getTurnaroundTimes(): Promise<AnalyticsData["turnaround"]> {
  await delay(300)
  return analytics.turnaround
}

export async function getBranchPerformance(): Promise<AnalyticsData["branchPerformance"]> {
  await delay(300)
  return analytics.branchPerformance
}

export async function getDoctorReferrals(): Promise<AnalyticsData["doctorReferrals"]> {
  await delay(300)
  return analytics.doctorReferrals
}

// Roles
export async function getRoles(): Promise<Role[]> {
  await delay(300)
  return roles
}

export async function getRoleById(id: string): Promise<Role | undefined> {
  await delay(200)
  return roles.find((r) => r.id === id)
}

export async function createRole(data: Omit<Role, "id" | "createdAt">): Promise<Role> {
  await delay(500)
  const role: Role = { ...data, id: "ROL" + String(roles.length + 1).padStart(3, "0"), createdAt: new Date().toISOString() }
  roles.push(role)
  return role
}

export async function updateRole(id: string, data: Partial<Role>): Promise<Role> {
  await delay(400)
  const idx = roles.findIndex((r) => r.id === id)
  if (idx === -1) throw new Error("Role not found")
  roles[idx] = { ...roles[idx], ...data }
  return roles[idx]
}

export async function deleteRole(id: string): Promise<void> {
  await delay(400)
  const idx = roles.findIndex((r) => r.id === id)
  if (idx !== -1) roles.splice(idx, 1)
}

// Tenants
export async function getTenants(): Promise<Tenant[]> {
  await delay(300)
  return tenants
}

export async function createTenant(data: Omit<Tenant, "id" | "createdAt">): Promise<Tenant> {
  await delay(500)
  const tenant: Tenant = { ...data, id: "TNT" + String(tenants.length + 1).padStart(3, "0"), createdAt: new Date().toISOString() }
  tenants.push(tenant)
  return tenant
}

export async function updateTenant(id: string, data: Partial<Tenant>): Promise<Tenant> {
  await delay(400)
  const idx = tenants.findIndex((t) => t.id === id)
  if (idx === -1) throw new Error("Tenant not found")
  tenants[idx] = { ...tenants[idx], ...data }
  return tenants[idx]
}

export async function deleteTenant(id: string): Promise<void> {
  await delay(400)
  const idx = tenants.findIndex((t) => t.id === id)
  if (idx !== -1) tenants.splice(idx, 1)
}

// Corporate
export async function getCorporateAccounts(): Promise<CorporateAccount[]> {
  await delay(400)
  return corporateAccounts
}

export async function getCorporateContracts(corporateId?: string): Promise<CorporateContract[]> {
  await delay(300)
  if (corporateId) return corporateContracts.filter((c) => c.corporateId === corporateId)
  return corporateContracts
}

// CRM
export async function getCampaigns(): Promise<Campaign[]> {
  await delay(400)
  return campaigns
}

export async function getLoyaltyPrograms(): Promise<LoyaltyProgram[]> {
  await delay(300)
  return loyaltyPrograms
}

export async function getCoupons(): Promise<Coupon[]> {
  await delay(300)
  return coupons
}

export async function validateCoupon(code: string, amount: number): Promise<{ valid: boolean; discount: number; coupon?: Coupon; message?: string }> {
  await delay(300)
  const coupon = coupons.find((c) => c.code === code && c.isActive)
  if (!coupon) return { valid: false, discount: 0, message: "Invalid or expired coupon code" }
  if (coupon.usedCount >= coupon.usageLimit) return { valid: false, discount: 0, message: "Coupon usage limit exceeded" }
  if (amount < coupon.minAmount) return { valid: false, discount: 0, message: `Minimum order amount of ₹${coupon.minAmount} required` }
  let discount = coupon.type === "flat" ? coupon.discount : Math.round((amount * coupon.discount) / 100)
  if (coupon.type === "percentage" && discount > coupon.maxDiscount) discount = coupon.maxDiscount
  return { valid: true, discount, coupon }
}

// Quality Control
export async function getQCRecords(params: { limit?: number; testId?: string; isInControl?: boolean } = {}): Promise<QCRecord[]> {
  await delay(400)
  let filtered = [...qcRecords]
  if (params.testId) filtered = filtered.filter((q) => q.testId === params.testId)
  if (params.isInControl !== undefined) filtered = filtered.filter((q) => q.isInControl === params.isInControl)
  if (params.limit) filtered = filtered.slice(0, params.limit)
  return filtered
}

export async function getCalibrationRecords(params: { status?: string; instrumentId?: string } = {}): Promise<CalibrationRecord[]> {
  await delay(300)
  let filtered = [...calibrationRecords]
  if (params.status) filtered = filtered.filter((c) => c.status === params.status)
  if (params.instrumentId) filtered = filtered.filter((c) => c.instrumentId === params.instrumentId)
  return filtered
}

// Home Collection
export async function getHCAgents(): Promise<HCAgent[]> {
  await delay(300)
  return homeCollectionAgents
}

export async function getHCBookings(params: { status?: string; agentId?: string } = {}): Promise<HCBooking[]> {
  await delay(400)
  let filtered = [...homeCollectionBookings]
  if (params.status) filtered = filtered.filter((b) => b.status === params.status)
  if (params.agentId) filtered = filtered.filter((b) => b.agentId === params.agentId)
  return filtered
}

export async function getHCRoutes(params: { date?: string; agentId?: string; status?: string } = {}): Promise<HCRoute[]> {
  await delay(300)
  let filtered = [...hcRoutes]
  if (params.date) filtered = filtered.filter((r) => r.date === params.date)
  if (params.agentId) filtered = filtered.filter((r) => r.agentId === params.agentId)
  if (params.status) filtered = filtered.filter((r) => r.status === params.status)
  return filtered
}

export async function assignHCAgent(bookingId: string, agentId: string): Promise<HCBooking> {
  await delay(400)
  const agent = homeCollectionAgents.find((a) => a.id === agentId)
  if (!agent) throw new Error("Agent not found")
  const idx = homeCollectionBookings.findIndex((b) => b.id === bookingId)
  if (idx === -1) throw new Error("Booking not found")
  homeCollectionBookings[idx] = { ...homeCollectionBookings[idx], agentId, agentName: agent.name, status: "assigned" }
  return homeCollectionBookings[idx]
}

// Dashboard
export async function getDashboardStats(): Promise<{
  totalPatients: number
  totalTests: number
  totalRevenue: number
  pendingResults: number
  todayBookings: number
  criticalValues: number
  activeBranches: number
  lowStockItems: number
}> {
  await delay(500)
  return {
    totalPatients: patients.length,
    totalTests: tests.length,
    totalRevenue: invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.total, 0),
    pendingResults: results.filter((r) => r.status !== "published").length,
    todayBookings: bookings.filter((b) => b.scheduledDate === new Date().toISOString().split("T")[0]).length,
    criticalValues: results.filter((r) => r.isCritical).length,
    activeBranches: branches.filter((b) => b.isActive).length,
    lowStockItems: getLowStockItems().length,
  }
}

// ==============================
// Extended Sample Lifecycle
// ==============================

export async function getSamplesExtended(params: PaginationParams & { search?: string; status?: string; department?: string; priority?: string } = {}): Promise<PaginatedResult<Sample>> {
  await delay(400)
  let filtered = [...samplesExtended]
  if (params.search) filtered = filterBySearch(filtered, params.search)
  if (params.status) filtered = filtered.filter((s) => s.status === params.status)
  if (params.department) filtered = filtered.filter((s) => s.department === params.department)
  if (params.priority) filtered = filtered.filter((s) => s.priority === params.priority)
  return paginate(filtered, params)
}

export async function getSampleById(id: string): Promise<Sample | undefined> {
  await delay(200)
  return samplesExtended.find((s) => s.id === id)
}

export async function getSampleTimeline(id: string): Promise<{ status: string; timestamp: string; performedBy: string; notes?: string }[]> {
  await delay(300)
  const sample = samplesExtended.find((s) => s.id === id)
  if (!sample) return []
  const events: { status: string; timestamp: string; performedBy: string; notes?: string }[] = []
  if (sample.collectedAt) events.push({ status: "collected", timestamp: sample.collectedAt, performedBy: sample.collectedBy || "" })
  if (sample.receivedAt) events.push({ status: "received", timestamp: sample.receivedAt, performedBy: sample.receivedBy || "" })
  if (sample.processedAt) events.push({ status: "processing", timestamp: sample.processedAt, performedBy: sample.processedBy || "" })
  if (sample.testedAt) events.push({ status: "testing", timestamp: sample.testedAt, performedBy: sample.testedBy || "" })
  if (sample.validatedAt) events.push({ status: "validation", timestamp: sample.validatedAt, performedBy: sample.validatedBy || "" })
  if (sample.approvedAt) events.push({ status: "approved", timestamp: sample.approvedAt, performedBy: sample.approvedBy || "" })
  if (sample.deliveredAt) events.push({ status: "delivered", timestamp: sample.deliveredAt, performedBy: "" })
  if (sample.rejectedAt) events.push({ status: "rejected", timestamp: sample.rejectedAt, performedBy: sample.rejectedBy || "", notes: sample.rejectedReason })
  if (sample.disposedAt) events.push({ status: "disposed", timestamp: sample.disposedAt, performedBy: sample.disposedBy || "", notes: sample.disposalReason })
  return events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
}

export async function getAliquots(params: { sampleId?: string; status?: string } = {}): Promise<Aliquot[]> {
  await delay(300)
  let filtered = [...aliquots]
  if (params.sampleId) filtered = filtered.filter((a) => a.parentSampleId === params.sampleId)
  if (params.status) filtered = filtered.filter((a) => a.status === params.status)
  return filtered
}

export async function createAliquot(data: Omit<Aliquot, "id">): Promise<Aliquot> {
  await delay(400)
  const aliquot: Aliquot = { ...data, id: "ALQ" + String(aliquots.length + 1).padStart(3, "0") }
  aliquots.push(aliquot)
  return aliquot
}

export async function getSampleTransfers(params: { sampleId?: string; status?: string; fromBranch?: string; toBranch?: string } = {}): Promise<SampleTransfer[]> {
  await delay(300)
  let filtered = [...sampleTransfers]
  if (params.sampleId) filtered = filtered.filter((t) => t.sampleId === params.sampleId)
  if (params.status) filtered = filtered.filter((t) => t.status === params.status)
  if (params.fromBranch) filtered = filtered.filter((t) => t.fromBranch === params.fromBranch)
  if (params.toBranch) filtered = filtered.filter((t) => t.toBranch === params.toBranch)
  return filtered
}

export async function createSampleTransfer(data: Omit<SampleTransfer, "id">): Promise<SampleTransfer> {
  await delay(400)
  const transfer: SampleTransfer = { ...data, id: "STR" + String(sampleTransfers.length + 1).padStart(3, "0") }
  sampleTransfers.push(transfer)
  return transfer
}

export async function getRetestRequests(params: { sampleId?: string; status?: string } = {}): Promise<RetestRequest[]> {
  await delay(300)
  let filtered = [...retestRequests]
  if (params.sampleId) filtered = filtered.filter((r) => r.sampleId === params.sampleId)
  if (params.status) filtered = filtered.filter((r) => r.status === params.status)
  return filtered
}

export async function createRetestRequest(data: Omit<RetestRequest, "id">): Promise<RetestRequest> {
  await delay(400)
  const req: RetestRequest = { ...data, id: "RTR" + String(retestRequests.length + 1).padStart(3, "0") }
  retestRequests.push(req)
  return req
}

export async function disposeSample(id: string, disposedBy: string, disposalReason: string): Promise<Sample> {
  await delay(300)
  const idx = samplesExtended.findIndex((s) => s.id === id)
  if (idx === -1) throw new Error("Sample not found")
  samplesExtended[idx] = { ...samplesExtended[idx], status: "disposed", disposedBy, disposedAt: new Date().toISOString(), disposalReason }
  return samplesExtended[idx]
}

export async function rejectSample(id: string, rejectedBy: string, rejectedReason: string, rejectionCategory: Sample["rejectionCategory"]): Promise<Sample> {
  await delay(300)
  const idx = samplesExtended.findIndex((s) => s.id === id)
  if (idx === -1) throw new Error("Sample not found")
  samplesExtended[idx] = { ...samplesExtended[idx], status: "rejected", rejectedBy, rejectedAt: new Date().toISOString(), rejectedReason, rejectionCategory }
  return samplesExtended[idx]
}

export async function requestRetest(sampleId: string, originalResultId: string, requestedBy: string, reason: string): Promise<RetestRequest> {
  await delay(400)
  const req: RetestRequest = {
    id: "RTR" + String(retestRequests.length + 1).padStart(3, "0"),
    sampleId,
    originalResultId,
    requestedBy,
    requestedAt: new Date().toISOString(),
    reason,
    status: "pending",
  }
  retestRequests.push(req)
  return req
}

// ==============================
// Extended Results
// ==============================

export async function getResultsExtended(params: PaginationParams & { search?: string; status?: string; department?: string; isCritical?: boolean; isAbnormal?: boolean } = {}): Promise<PaginatedResult<Result>> {
  await delay(500)
  let filtered = [...results]
  if (params.search) filtered = filterBySearch(filtered, params.search)
  if (params.status) filtered = filtered.filter((r) => r.status === params.status)
  if (params.department) filtered = filtered.filter((r) => r.department === params.department)
  if (params.isCritical !== undefined) filtered = filtered.filter((r) => r.isCritical === params.isCritical)
  if (params.isAbnormal !== undefined) filtered = filtered.filter((r) => r.isAbnormal === params.isAbnormal)
  return paginate(filtered, params)
}

export async function verifyResult(id: string, verifiedBy: string): Promise<Result> {
  return updateResultStatus(id, "verified", { verifiedAt: new Date().toISOString(), verifiedBy })
}

export async function validateResult(id: string, validatedBy: string): Promise<Result> {
  return updateResultStatus(id, "validated", { validatedAt: new Date().toISOString(), validatedBy })
}

export async function approveResult(id: string, approvedBy: string): Promise<Result> {
  return updateResultStatus(id, "approved", { approvedAt: new Date().toISOString(), approvedBy })
}

export async function getCriticalAlerts(params: { status?: string; patientId?: string } = {}): Promise<CriticalAlert[]> {
  await delay(300)
  let filtered = [...criticalAlerts]
  if (params.status) filtered = filtered.filter((a) => a.status === params.status)
  if (params.patientId) filtered = filtered.filter((a) => a.patientId === params.patientId)
  return filtered
}

export async function acknowledgeCriticalAlert(id: string, acknowledgedBy: string): Promise<CriticalAlert> {
  await delay(200)
  const idx = criticalAlerts.findIndex((a) => a.id === id)
  if (idx === -1) throw new Error("Critical alert not found")
  criticalAlerts[idx] = { ...criticalAlerts[idx], status: "acknowledged", acknowledgedBy, acknowledgedAt: new Date().toISOString() }
  return criticalAlerts[idx]
}

export async function getDeltaCheck(resultId: string): Promise<{ parameterName: string; previousValue: string; currentValue: string; change: number }[]> {
  await delay(300)
  const result = results.find((r) => r.id === resultId)
  if (!result?.previousValues) return []
  return result.previousValues
}

export async function amendResult(id: string, amendedBy: string, amendmentReason: string, parameters: ResultParameter[]): Promise<Result> {
  await delay(500)
  const idx = results.findIndex((r) => r.id === id)
  if (idx === -1) throw new Error("Result not found")
  results[idx] = {
    ...results[idx],
    status: "amended",
    amendedBy,
    amendedAt: new Date().toISOString(),
    amendmentReason,
    parameters,
  }
  return results[idx]
}

// ==============================
// Pathologist
// ==============================

export { pathologistReviews }

export async function getPathologistReviews(params: { status?: string; reviewerId?: string } = {}): Promise<PathologistReview[]> {
  await delay(400)
  let filtered = [...pathologistReviews]
  if (params.status) filtered = filtered.filter((r) => r.status === params.status)
  if (params.reviewerId) filtered = filtered.filter((r) => r.reviewerId === params.reviewerId)
  return filtered
}

export async function getReviewById(id: string): Promise<PathologistReview | undefined> {
  await delay(200)
  return pathologistReviews.find((r) => r.id === id)
}

export async function approveReview(id: string, signature: string): Promise<PathologistReview> {
  await delay(300)
  const idx = pathologistReviews.findIndex((r) => r.id === id)
  if (idx === -1) throw new Error("Review not found")
  pathologistReviews[idx] = { ...pathologistReviews[idx], status: "approved", digitalSignature: signature, signatureDate: new Date().toISOString() }
  return pathologistReviews[idx]
}

export async function rejectReview(id: string, reason: string): Promise<PathologistReview> {
  await delay(300)
  const idx = pathologistReviews.findIndex((r) => r.id === id)
  if (idx === -1) throw new Error("Review not found")
  pathologistReviews[idx] = { ...pathologistReviews[idx], status: "rejected" }
  return pathologistReviews[idx]
}

export async function addComment(reviewId: string, author: string, text: string, isInternal: boolean): Promise<PathologistReview> {
  await delay(200)
  const idx = pathologistReviews.findIndex((r) => r.id === reviewId)
  if (idx === -1) throw new Error("Review not found")
  const comment: PathologistComment = {
    id: "CMT" + String(pathologistReviews[idx].comments.length + 1).padStart(3, "0"),
    author,
    text,
    createdAt: new Date().toISOString(),
    isInternal,
  }
  pathologistReviews[idx].comments.push(comment)
  return pathologistReviews[idx]
}

export async function signReport(reviewId: string, signature: string): Promise<PathologistReview> {
  await delay(300)
  const idx = pathologistReviews.findIndex((r) => r.id === reviewId)
  if (idx === -1) throw new Error("Review not found")
  pathologistReviews[idx] = { ...pathologistReviews[idx], digitalSignature: signature, signatureDate: new Date().toISOString() }
  return pathologistReviews[idx]
}

// ==============================
// Reports
// ==============================

export async function getReportTemplates(): Promise<ReportTemplate[]> {
  await delay(300)
  return reportTemplates
}

export async function updateReportTemplate(id: string, data: Partial<ReportTemplate>): Promise<ReportTemplate> {
  await delay(300)
  const idx = reportTemplates.findIndex((t) => t.id === id)
  if (idx === -1) throw new Error("Template not found")
  reportTemplates[idx] = { ...reportTemplates[idx], ...data }
  return reportTemplates[idx]
}

export async function getSharedReports(params: { status?: string; resultId?: string } = {}): Promise<SharedReport[]> {
  await delay(300)
  let filtered = [...sharedReports]
  if (params.status) filtered = filtered.filter((r) => r.status === params.status)
  if (params.resultId) filtered = filtered.filter((r) => r.resultId === params.resultId)
  return filtered
}

export async function shareReport(resultId: string, sharedWith: string[], expiresInDays = 90): Promise<SharedReport> {
  await delay(400)
  const now = new Date()
  const expiresAt = new Date(now.getTime() + expiresInDays * 86400000).toISOString()
  const report: SharedReport = {
    id: "SHR" + String(sharedReports.length + 1).padStart(3, "0"),
    resultId,
    shareLink: "https://reports.lifsyslab.com/share/" + btoa(now.toISOString() + "-" + resultId + "-" + Math.random().toString(36).substring(2)),
    sharedWith,
    sharedAt: now.toISOString(),
    expiresAt,
    accessCount: 0,
    status: "active",
  }
  sharedReports.push(report)
  return report
}

export async function getPatientSummary(patientId: string): Promise<{ recentResults: Result[]; pendingTests: string[]; totalVisits: number }> {
  await delay(400)
  const patientResults = results.filter((r) => r.patientId === patientId)
  const pending = samplesExtended.filter((s) => s.patientId === patientId && ["registered", "collected", "received", "processing", "testing"].includes(s.status))
  return {
    recentResults: patientResults.slice(0, 10),
    pendingTests: pending.map((s) => s.testName),
    totalVisits: patientResults.length,
  }
}

// ==============================
// Instruments Extended
// ==============================

export async function getInstrumentLogs(params: { instrumentId?: string; type?: string; limit?: number } = {}): Promise<InstrumentLog[]> {
  await delay(300)
  let filtered = [...instrumentLogs]
  if (params.instrumentId) filtered = filtered.filter((l) => l.instrumentId === params.instrumentId)
  if (params.type) filtered = filtered.filter((l) => l.type === params.type)
  if (params.limit) filtered = filtered.slice(0, params.limit)
  return filtered
}

export async function getInstrumentErrors(params: { instrumentId?: string; severity?: string; resolved?: boolean } = {}): Promise<InstrumentError[]> {
  await delay(300)
  let filtered = [...instrumentErrors]
  if (params.instrumentId) filtered = filtered.filter((e) => e.instrumentId === params.instrumentId)
  if (params.severity) filtered = filtered.filter((e) => e.severity === params.severity)
  if (params.resolved !== undefined) filtered = filtered.filter((e) => params.resolved ? e.resolvedAt !== undefined : e.resolvedAt === undefined)
  return filtered
}

export async function resolveError(id: string, resolvedBy: string, notes?: string): Promise<InstrumentError> {
  await delay(300)
  const idx = instrumentErrors.findIndex((e) => e.id === id)
  if (idx === -1) throw new Error("Error not found")
  instrumentErrors[idx] = { ...instrumentErrors[idx], resolvedAt: new Date().toISOString(), resolvedBy, notes: notes || instrumentErrors[idx].notes }
  return instrumentErrors[idx]
}

export async function getCalibrationRecordsExtended(params: { instrumentId?: string; status?: string } = {}): Promise<CalibrationRecordT[]> {
  await delay(300)
  let filtered = [...calibrationRecordsExt]
  if (params.instrumentId) filtered = filtered.filter((c) => c.instrumentId === params.instrumentId)
  if (params.status) filtered = filtered.filter((c) => c.status === params.status)
  return filtered
}

export async function getMaintenanceRecords(params: { instrumentId?: string; status?: string; type?: string } = {}): Promise<MaintenanceRecord[]> {
  await delay(300)
  let filtered = [...maintenanceRecords]
  if (params.instrumentId) filtered = filtered.filter((m) => m.instrumentId === params.instrumentId)
  if (params.status) filtered = filtered.filter((m) => m.status === params.status)
  if (params.type) filtered = filtered.filter((m) => m.type === params.type)
  return filtered
}

// ==============================
// Quality Control
// ==============================

export async function getQCRecordsExtended(params: { testId?: string; result?: string; level?: string; limit?: number } = {}): Promise<QCRecordT[]> {
  await delay(400)
  let filtered = [...qcRecordsNew]
  if (params.testId) filtered = filtered.filter((q) => q.testId === params.testId)
  if (params.result) filtered = filtered.filter((q) => q.result === params.result)
  if (params.level) filtered = filtered.filter((q) => q.level === params.level)
  if (params.limit) filtered = filtered.slice(0, params.limit)
  return filtered
}

export async function getLeveyJenningsData(testId: string, days = 30): Promise<QCRecordT[]> {
  await delay(300)
  const cutoff = new Date(Date.now() - days * 86400000).toISOString()
  return qcRecordsNew.filter((q) => q.testId === testId && q.performedAt >= cutoff).sort((a, b) => a.performedAt.localeCompare(b.performedAt))
}

export async function getWestgardViolations(params: { severity?: string; resolved?: boolean } = {}): Promise<WestgardViolation[]> {
  await delay(300)
  let filtered = [...westgardViolations]
  if (params.severity) filtered = filtered.filter((v) => v.severity === params.severity)
  if (params.resolved !== undefined) filtered = filtered.filter((v) => params.resolved ? v.resolvedAt !== undefined : v.resolvedAt === undefined)
  return filtered
}

export async function resolveViolation(id: string, resolvedBy: string, action: string): Promise<WestgardViolation> {
  await delay(300)
  const idx = westgardViolations.findIndex((v) => v.id === id)
  if (idx === -1) throw new Error("Violation not found")
  westgardViolations[idx] = { ...westgardViolations[idx], resolvedAt: new Date().toISOString(), resolvedBy, action }
  return westgardViolations[idx]
}

export async function getQCDashboard(): Promise<{
  totalTests: number; inControl: number; warnings: number; outOfControl: number; violations: number; openAlerts: number
}> {
  await delay(300)
  const total = qcRecordsNew.length
  return {
    totalTests: total,
    inControl: qcRecordsNew.filter((q) => q.result === "in_control").length,
    warnings: qcRecordsNew.filter((q) => q.result === "warning").length,
    outOfControl: qcRecordsNew.filter((q) => q.result === "out_of_control" || q.result === "violation").length,
    violations: westgardViolations.filter((v) => !v.resolvedAt).length,
    openAlerts: qcAlerts.filter((a) => a.status === "open").length,
  }
}

// ==============================
// Home Collection Extended
// ==============================

export async function getAgents(params: { status?: string; branchId?: string } = {}): Promise<Agent[]> {
  await delay(300)
  let filtered = [...agents]
  if (params.status) filtered = filtered.filter((a) => a.status === params.status)
  if (params.branchId) filtered = filtered.filter((a) => a.branchId === params.branchId)
  return filtered
}

export async function getAgentById(id: string): Promise<Agent | undefined> {
  await delay(200)
  return agents.find((a) => a.id === id)
}

export async function getHCRoutesExtended(params: { date?: string; agentId?: string; status?: string } = {}): Promise<HCRouteT[]> {
  await delay(300)
  let filtered = [...hcRoutesNew]
  if (params.date) filtered = filtered.filter((r) => r.date === params.date)
  if (params.agentId) filtered = filtered.filter((r) => r.agentId === params.agentId)
  if (params.status) filtered = filtered.filter((r) => r.status === params.status)
  return filtered
}

export async function getHCRouteById(id: string): Promise<HCRouteT | undefined> {
  await delay(200)
  return hcRoutesNew.find((r) => r.id === id)
}

export async function getHCVisits(params: { agentId?: string; status?: string; date?: string } = {}): Promise<HCVisit[]> {
  await delay(300)
  let filtered = [...hcVisits]
  if (params.agentId) filtered = filtered.filter((v) => v.agentId === params.agentId)
  if (params.status) filtered = filtered.filter((v) => v.status === params.status)
  if (params.date) filtered = filtered.filter((v) => v.scheduledTime.startsWith(params.date!))
  return filtered
}

export async function updateVisitStatus(id: string, status: HCVisit["status"], extra?: Partial<HCVisit>): Promise<HCVisit> {
  await delay(200)
  const idx = hcVisits.findIndex((v) => v.id === id)
  if (idx === -1) throw new Error("Visit not found")
  const now = new Date().toISOString()
  const updates: Partial<HCVisit> = {}
  if (status === "arrived") updates.actualArrival = now
  if (status === "completed") updates.actualDeparture = now
  hcVisits[idx] = { ...hcVisits[idx], status, ...updates, ...extra }
  return hcVisits[idx]
}

export async function assignAgent(visitId: string, agentId: string): Promise<HCVisit> {
  await delay(300)
  const agent = agents.find((a) => a.id === agentId)
  if (!agent) throw new Error("Agent not found")
  const idx = hcVisits.findIndex((v) => v.id === visitId)
  if (idx === -1) throw new Error("Visit not found")
  hcVisits[idx] = { ...hcVisits[idx], agentId }
  return hcVisits[idx]
}

// ==============================
// Workload
// ==============================

export async function getWorkloadMetrics(): Promise<WorkloadMetrics[]> {
  await delay(300)
  return workloadMetrics
}

export async function getDepartmentDashboard(department: string): Promise<DepartmentDashboard | undefined> {
  await delay(200)
  return departmentDashboards.find((d) => d.department === department)
}

// ==============================
// Executive
// ==============================

export async function getRevenueTrendExtended(): Promise<typeof revenueTrend> {
  await delay(300)
  return revenueTrend
}

export async function getTATData(params: { department?: string } = {}): Promise<typeof tatData> {
  await delay(300)
  if (params.department) return tatData.filter((t) => t.department === params.department)
  return tatData
}

export async function getSampleVolumeTrend(): Promise<typeof sampleVolumeTrend> {
  await delay(300)
  return sampleVolumeTrend
}

export async function getDoctorReferralsExtended(): Promise<typeof drReferrals> {
  await delay(300)
  return drReferrals
}

export async function getBranchPerformanceExtended(): Promise<typeof brPerformance> {
  await delay(300)
  return brPerformance
}

export async function getInventoryHealth(): Promise<typeof inventoryHealth> {
  await delay(300)
  return inventoryHealth
}

export async function getOutstandingPayments(): Promise<typeof outstandingPayments> {
  await delay(300)
  return outstandingPayments
}

export async function getPendingReports(): Promise<typeof pendingReports> {
  await delay(300)
  return pendingReports
}

// ==============================
// Vendors
// ==============================

export async function getVendors(params: { search?: string; category?: string; status?: string } = {}): Promise<Vendor[]> {
  await delay(400)
  let filtered = [...vendors]
  if (params.search) {
    const q = params.search.toLowerCase()
    filtered = filtered.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.contactPerson.toLowerCase().includes(q) ||
        v.email.toLowerCase().includes(q)
    )
  }
  if (params.category) filtered = filtered.filter((v) => v.category === params.category)
  if (params.status) filtered = filtered.filter((v) => v.status === params.status)
  return filtered
}

export async function getVendorById(id: string): Promise<Vendor | undefined> {
  await delay(200)
  return vendors.find((v) => v.id === id)
}

export async function createVendor(data: Omit<Vendor, "id" | "totalOrders" | "rating" | "lastOrderDate">): Promise<Vendor> {
  await delay(500)
  const vendor: Vendor = {
    ...data,
    id: "V" + String(vendors.length + 1).padStart(3, "0"),
    rating: 0,
    totalOrders: 0,
    lastOrderDate: "",
  }
  vendors.push(vendor)
  return vendor
}

export async function updateVendor(id: string, data: Partial<Vendor>): Promise<Vendor> {
  await delay(400)
  const idx = vendors.findIndex((v) => v.id === id)
  if (idx === -1) throw new Error("Vendor not found")
  vendors[idx] = { ...vendors[idx], ...data }
  return vendors[idx]
}

export async function deleteVendor(id: string): Promise<void> {
  await delay(400)
  const idx = vendors.findIndex((v) => v.id === id)
  if (idx !== -1) vendors.splice(idx, 1)
}
