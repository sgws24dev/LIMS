import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "@/components/ui/toaster"
import { AppLayout } from "@/components/layout"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { TooltipProvider } from "@/components/ui/tooltip"

import LoginPage from "@/pages/auth/login"
import ForgotPasswordPage from "@/pages/auth/forgot-password"
import ResetPasswordPage from "@/pages/auth/reset-password"
import MfaVerificationPage from "@/pages/auth/mfa-verification"
import ChangePasswordPage from "@/pages/auth/change-password"

import SuperAdminDashboard from "@/pages/dashboard/super-admin"
import LabAdminDashboard from "@/pages/dashboard/lab-admin"
import BranchDashboard from "@/pages/dashboard/branch"
import TechnicianDashboard from "@/pages/dashboard/technician"
import DoctorDashboard from "@/pages/dashboard/doctor"

import UsersList from "@/pages/users/users-list"
import CreateUser from "@/pages/users/create-user"
import EditUser from "@/pages/users/edit-user"
import UserDetails from "@/pages/users/user-details"

import RolesList from "@/pages/roles/roles-list"
import CreateRolePage from "@/pages/roles/create-role"
import EditRolePage from "@/pages/roles/edit-role"
import RoleDetailsPage from "@/pages/roles/role-details"
import PermissionMatrix from "@/pages/roles/permission-matrix"

import PatientsList from "@/pages/patients/patients-list"
import CreatePatient from "@/pages/patients/create-patient"
import EditPatient from "@/pages/patients/edit-patient"
import PatientDetails from "@/pages/patients/patient-details"
import PatientAnalytics from "@/pages/patients/patient-analytics"

import DoctorsList from "@/pages/doctors/doctors-list"
import CreateDoctor from "@/pages/doctors/create-doctor"
import EditDoctor from "@/pages/doctors/edit-doctor"
import DoctorProfile from "@/pages/doctors/doctor-profile"
import ReferralTracking from "@/pages/doctors/referral-tracking"

import BranchesList from "@/pages/branches/branches-list"
import CreateBranch from "@/pages/branches/create-branch"
import EditBranch from "@/pages/branches/edit-branch"
import BranchDetails from "@/pages/branches/branch-details"
import BranchPerformance from "@/pages/branches/branch-performance"

import TestsList from "@/pages/test-catalog/tests-list"
import CreateTestPage from "@/pages/test-catalog/create-test"
import EditTestPage from "@/pages/test-catalog/edit-test"
import TestDetailsPage from "@/pages/test-catalog/test-details"
import TestCategories from "@/pages/test-catalog/test-categories"
import TestPackages from "@/pages/test-catalog/test-packages"

import BookingsList from "@/pages/booking/bookings-list"
import BookingDetailsPage from "@/pages/booking/booking-details"
import WalkInRegistration from "@/pages/booking/walk-in-registration"
import BookingHistory from "@/pages/booking/booking-history"
import BookingQueue from "@/pages/booking/booking-queue"

/* ── Sample Collection (legacy redirects) ── */
import SampleCollection from "@/pages/sample-collection/collection-queue"
import SampleTracking from "@/pages/sample-collection/sample-tracking"

/* ── Lab Workflow (legacy redirects) ── */
import SampleReceiving from "@/pages/lab-workflow/sample-receiving"
import Accessioning from "@/pages/lab-workflow/accessioning"
import ProcessingQueue from "@/pages/lab-workflow/processing-queue"
import RejectedSamples from "@/pages/lab-workflow/rejected-samples"

/* ── New Sample Lifecycle ── */
import SampleRegistration from "@/pages/samples/sample-registration"
import SampleTrackingDashboard from "@/pages/samples/sample-tracking-dashboard"
import SampleDetails from "@/pages/samples/sample-details"
import SampleCollectionQueue from "@/pages/samples/sample-collection-queue"
import SampleReceivingNew from "@/pages/samples/sample-receiving"
import AliquotManagement from "@/pages/samples/aliquot-management"
import SampleTransfer from "@/pages/samples/sample-transfer"
import SampleRetesting from "@/pages/samples/sample-retesting"
import SampleDisposal from "@/pages/samples/sample-disposal"

/* ── Lab Operations ── */
import TechnicianWorkbench from "@/pages/lab-ops/technician-workbench"
import WorkloadDashboard from "@/pages/lab-ops/workload-dashboard"
import DepartmentDashboard from "@/pages/lab-ops/department-dashboard"

/* ── Results ── */
import ResultEntry from "@/pages/results/result-entry"
import BulkResultEntry from "@/pages/results/bulk-result-entry"
import CriticalAlerts from "@/pages/results/critical-alerts"
import ResultVerification from "@/pages/results/result-verification"
import ResultValidation from "@/pages/results/result-validation"
import DeltaCheck from "@/pages/results/delta-check"
import ReferenceRanges from "@/pages/results/reference-ranges"
import AbnormalResults from "@/pages/results/abnormal-results"

/* ── Pathologist Review ── */
import ReviewQueue from "@/pages/pathologist/review-queue"
import ApprovalQueue from "@/pages/pathologist/approval-queue"
import ReportPreview from "@/pages/pathologist/report-preview"
import ApprovalHistory from "@/pages/pathologist/approval-history"
import RejectedReports from "@/pages/pathologist/rejected-reports"
import ReportComments from "@/pages/pathologist/report-comments"

/* ── Reports ── */
import ReportsList from "@/pages/reports/reports-list"
import ReportApproval from "@/pages/reports/report-approval"
import PdfPreview from "@/pages/reports/pdf-preview"
import ReportBranding from "@/pages/reports/report-branding"
import QrVerification from "@/pages/reports/qr-verification"
import PatientSummary from "@/pages/reports/patient-summary"
import AiInterpretation from "@/pages/reports/ai-interpretation"
import ShareCenter from "@/pages/reports/share-center"

/* ── Instruments ── */
import InstrumentsList from "@/pages/instruments/instruments-list"
import InstrumentConfig from "@/pages/instruments/instrument-config"
import InstrumentDashboard from "@/pages/instruments/instrument-dashboard"
import ConnectionStatus from "@/pages/instruments/connection-status"
import InstrumentLogs from "@/pages/instruments/instrument-logs"
import ImportResults from "@/pages/instruments/import-results"
import MappingConfig from "@/pages/instruments/mapping-config"
import ErrorDashboard from "@/pages/instruments/error-dashboard"

/* ── Quality Control ── */
import QualityControl from "@/pages/quality-control/internal-qc"
import QcDashboard from "@/pages/quality-control/qc-dashboard"
import CalibrationRecords from "@/pages/quality-control/calibration-records"
import MaintenanceRecords from "@/pages/quality-control/maintenance-records"
import QcAlerts from "@/pages/quality-control/qc-alerts"
import LeveyJennings from "@/pages/quality-control/levey-jennings"
import WestgardRules from "@/pages/quality-control/westgard-rules"

/* ── Home Collection ── */
import HomeCollection from "@/pages/home-collection/home-collection"
import CollectionCalendar from "@/pages/home-collection/collection-calendar"
import RoutePlanner from "@/pages/home-collection/route-planner"
import AgentAssignment from "@/pages/home-collection/agent-assignment"
import GpsTracking from "@/pages/home-collection/gps-tracking"
import VisitTimeline from "@/pages/home-collection/visit-timeline"
import SuccessDashboard from "@/pages/home-collection/success-dashboard"

/* ── Executive Dashboards ── */
import RevenueDashboard from "@/pages/executive/revenue-dashboard"
import TurnaroundDashboard from "@/pages/executive/turnaround-dashboard"
import SampleVolumeDashboard from "@/pages/executive/sample-volume-dashboard"
import DoctorReferralsDashboard from "@/pages/executive/doctor-referrals-dashboard"
import BranchPerformanceExec from "@/pages/executive/branch-performance"
import InventoryHealth from "@/pages/executive/inventory-health"
import OutstandingPayments from "@/pages/executive/outstanding-payments"
import PendingReportsDashboard from "@/pages/executive/pending-reports"

/* ── Premium UX ── */
import KanbanBoard from "@/pages/premium/kanban-board"
import SplitView from "@/pages/premium/split-view"
import SavedFilters from "@/pages/premium/saved-filters"
import QuickActions from "@/pages/premium/quick-actions"
import SidePanel from "@/pages/premium/side-panel"

/* ── Existing modules ── */
import InvoicesList from "@/pages/billing/invoices-list"
import CreateInvoicePage from "@/pages/billing/create-invoice"
import InvoiceDetailsPage from "@/pages/billing/invoice-details"
import PaymentsList from "@/pages/billing/payments-list"
import FinancialDashboard from "@/pages/billing/financial-dashboard"
import InventoryDashboard from "@/pages/inventory/inventory-dashboard"
import ReagentsList from "@/pages/inventory/reagents-list"
import PurchaseOrders from "@/pages/inventory/purchase-orders"
import VendorsList from "@/pages/inventory/vendors-list"
import CorporateAccounts from "@/pages/corporate/corporate-accounts"
import ContractsList from "@/pages/corporate/contracts-list"
import CampaignDashboard from "@/pages/crm/campaign-dashboard"
import NotificationCenter from "@/pages/notifications/notification-center"
import AnalyticsBI from "@/pages/analytics/analytics-bi"
import AuditLogs from "@/pages/audit/audit-logs"
import GeneralSettings from "@/pages/settings/general-settings"
import Departments from "@/pages/settings/departments"
import SubscriptionPlans from "@/pages/subscription/subscription-plans"
import TenantManagement from "@/pages/subscription/tenant-management"
import PatientPortalDashboard from "@/pages/patient-portal/dashboard"
import PatientPortalReports from "@/pages/patient-portal/reports"
import DoctorPortalDashboard from "@/pages/doctor-portal/dashboard"
import MobileApps from "@/pages/mobile-apps/mobile-apps"
import AiFeatures from "@/pages/ai-features/ai-features"
import NotFoundPage from "@/pages/not-found"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/mfa-verification" element={<MfaVerificationPage />} />
            <Route path="/change-password" element={<ChangePasswordPage />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Navigate to="/dashboard/super-admin" replace />} />
              <Route path="/dashboard/super-admin" element={<SuperAdminDashboard />} />
              <Route path="/dashboard/lab-admin" element={<LabAdminDashboard />} />
              <Route path="/dashboard/branch" element={<BranchDashboard />} />
              <Route path="/dashboard/technician" element={<TechnicianDashboard />} />
              <Route path="/dashboard/doctor" element={<DoctorDashboard />} />

              <Route path="/users" element={<UsersList />} />
              <Route path="/users/create" element={<CreateUser />} />
              <Route path="/users/:id/edit" element={<EditUser />} />
              <Route path="/users/:id" element={<UserDetails />} />

              <Route path="/roles" element={<RolesList />} />
              <Route path="/roles/create" element={<CreateRolePage />} />
              <Route path="/roles/permission-matrix" element={<PermissionMatrix />} />
              <Route path="/roles/:id/edit" element={<EditRolePage />} />
              <Route path="/roles/:id" element={<RoleDetailsPage />} />

              <Route path="/patients" element={<PatientsList />} />
              <Route path="/patients/create" element={<CreatePatient />} />
              <Route path="/patients/:id/edit" element={<EditPatient />} />
              <Route path="/patients/:id" element={<PatientDetails />} />
              <Route path="/patients/analytics" element={<PatientAnalytics />} />

              <Route path="/doctors" element={<DoctorsList />} />
              <Route path="/doctors/create" element={<CreateDoctor />} />
              <Route path="/doctors/:id/edit" element={<EditDoctor />} />
              <Route path="/doctors/:id" element={<DoctorProfile />} />
              <Route path="/doctors/referral-tracking" element={<ReferralTracking />} />

              <Route path="/branches" element={<BranchesList />} />
              <Route path="/branches/create" element={<CreateBranch />} />
              <Route path="/branches/:id/edit" element={<EditBranch />} />
              <Route path="/branches/:id" element={<BranchDetails />} />
              <Route path="/branches/performance" element={<BranchPerformance />} />

              <Route path="/tests" element={<TestsList />} />
              <Route path="/tests/create" element={<CreateTestPage />} />
              <Route path="/tests/categories" element={<TestCategories />} />
              <Route path="/tests/packages" element={<TestPackages />} />
              <Route path="/tests/:id/edit" element={<EditTestPage />} />
              <Route path="/tests/:id" element={<TestDetailsPage />} />

              <Route path="/bookings" element={<BookingsList />} />
              <Route path="/bookings/walk-in" element={<WalkInRegistration />} />
              <Route path="/bookings/history" element={<BookingHistory />} />
              <Route path="/bookings/queue" element={<BookingQueue />} />
              <Route path="/bookings/:id" element={<BookingDetailsPage />} />

              {/* ── Sample Lifecycle ── */}
              <Route path="/samples/register" element={<SampleRegistration />} />
              <Route path="/samples/tracking" element={<SampleTrackingDashboard />} />
              <Route path="/samples/:id" element={<SampleDetails />} />
              <Route path="/samples/collection-queue" element={<SampleCollectionQueue />} />
              <Route path="/samples/receiving" element={<SampleReceivingNew />} />
              <Route path="/samples/aliquots" element={<AliquotManagement />} />
              <Route path="/samples/transfers" element={<SampleTransfer />} />
              <Route path="/samples/retesting" element={<SampleRetesting />} />
              <Route path="/samples/disposal" element={<SampleDisposal />} />

              {/* ── Legacy redirects ── */}
              <Route path="/sample-collection" element={<SampleCollection />} />
              <Route path="/sample-collection/tracking" element={<SampleTracking />} />
              <Route path="/lab-workflow" element={<SampleReceiving />} />
              <Route path="/lab-workflow/accessioning" element={<Accessioning />} />
              <Route path="/lab-workflow/processing" element={<ProcessingQueue />} />
              <Route path="/lab-workflow/rejected" element={<RejectedSamples />} />

              {/* ── Lab Operations ── */}
              <Route path="/lab-ops/technician-workbench" element={<TechnicianWorkbench />} />
              <Route path="/lab-ops/workload" element={<WorkloadDashboard />} />
              <Route path="/lab-ops/department" element={<DepartmentDashboard />} />

              {/* ── Results ── */}
              <Route path="/results" element={<ResultEntry />} />
              <Route path="/results/bulk" element={<BulkResultEntry />} />
              <Route path="/results/verification" element={<ResultVerification />} />
              <Route path="/results/validation" element={<ResultValidation />} />
              <Route path="/results/delta-check" element={<DeltaCheck />} />
              <Route path="/results/reference-ranges" element={<ReferenceRanges />} />
              <Route path="/results/abnormal" element={<AbnormalResults />} />
              <Route path="/results/critical-alerts" element={<CriticalAlerts />} />

              {/* ── Pathologist Review ── */}
              <Route path="/pathologist/review" element={<ReviewQueue />} />
              <Route path="/pathologist/approval" element={<ApprovalQueue />} />
              <Route path="/pathologist/preview" element={<ReportPreview />} />
              <Route path="/pathologist/history" element={<ApprovalHistory />} />
              <Route path="/pathologist/rejected" element={<RejectedReports />} />
              <Route path="/pathologist/comments" element={<ReportComments />} />

              {/* ── Reports ── */}
              <Route path="/reports" element={<ReportsList />} />
              <Route path="/reports/approval" element={<ReportApproval />} />
              <Route path="/reports/pdf-preview" element={<PdfPreview />} />
              <Route path="/reports/branding" element={<ReportBranding />} />
              <Route path="/reports/qr-verification" element={<QrVerification />} />
              <Route path="/reports/patient-summary" element={<PatientSummary />} />
              <Route path="/reports/ai-interpretation" element={<AiInterpretation />} />
              <Route path="/reports/share" element={<ShareCenter />} />

              {/* ── Instruments ── */}
              <Route path="/instruments" element={<InstrumentsList />} />
              <Route path="/instruments/:id/config" element={<InstrumentConfig />} />
              <Route path="/instruments/dashboard" element={<InstrumentDashboard />} />
              <Route path="/instruments/connection" element={<ConnectionStatus />} />
              <Route path="/instruments/logs" element={<InstrumentLogs />} />
              <Route path="/instruments/import" element={<ImportResults />} />
              <Route path="/instruments/mapping" element={<MappingConfig />} />
              <Route path="/instruments/errors" element={<ErrorDashboard />} />

              {/* ── Quality Control ── */}
              <Route path="/quality-control" element={<QualityControl />} />
              <Route path="/quality-control/dashboard" element={<QcDashboard />} />
              <Route path="/quality-control/calibration" element={<CalibrationRecords />} />
              <Route path="/quality-control/maintenance" element={<MaintenanceRecords />} />
              <Route path="/quality-control/alerts" element={<QcAlerts />} />
              <Route path="/quality-control/levey-jennings" element={<LeveyJennings />} />
              <Route path="/quality-control/westgard" element={<WestgardRules />} />

              <Route path="/billing" element={<InvoicesList />} />
              <Route path="/billing/invoices/new" element={<CreateInvoicePage />} />
              <Route path="/billing/invoices/:id" element={<InvoiceDetailsPage />} />
              <Route path="/billing/payments" element={<PaymentsList />} />
              <Route path="/billing/financial-dashboard" element={<FinancialDashboard />} />

              <Route path="/inventory" element={<InventoryDashboard />} />
              <Route path="/inventory/reagents" element={<ReagentsList />} />
              <Route path="/inventory/purchase-orders" element={<PurchaseOrders />} />
              <Route path="/inventory/vendors" element={<VendorsList />} />

              <Route path="/corporate" element={<CorporateAccounts />} />
              <Route path="/corporate/contracts" element={<ContractsList />} />

              {/* ── Home Collection ── */}
              <Route path="/home-collection" element={<HomeCollection />} />
              <Route path="/home-collection/calendar" element={<CollectionCalendar />} />
              <Route path="/home-collection/routes" element={<RoutePlanner />} />
              <Route path="/home-collection/agents" element={<AgentAssignment />} />
              <Route path="/home-collection/gps" element={<GpsTracking />} />
              <Route path="/home-collection/visits" element={<VisitTimeline />} />
              <Route path="/home-collection/success" element={<SuccessDashboard />} />

              {/* ── Executive Dashboards ── */}
              <Route path="/executive/revenue" element={<RevenueDashboard />} />
              <Route path="/executive/turnaround" element={<TurnaroundDashboard />} />
              <Route path="/executive/volume" element={<SampleVolumeDashboard />} />
              <Route path="/executive/referrals" element={<DoctorReferralsDashboard />} />
              <Route path="/executive/branches" element={<BranchPerformanceExec />} />
              <Route path="/executive/inventory" element={<InventoryHealth />} />
              <Route path="/executive/payments" element={<OutstandingPayments />} />
              <Route path="/executive/pending-reports" element={<PendingReportsDashboard />} />

              {/* ── Premium UX ── */}
              <Route path="/premium/kanban" element={<KanbanBoard />} />
              <Route path="/premium/split-view" element={<SplitView />} />
              <Route path="/premium/saved-filters" element={<SavedFilters />} />
              <Route path="/premium/quick-actions" element={<QuickActions />} />
              <Route path="/premium/side-panel" element={<SidePanel />} />

              <Route path="/crm" element={<CampaignDashboard />} />

              <Route path="/notifications" element={<NotificationCenter />} />

              <Route path="/analytics" element={<AnalyticsBI />} />

              <Route path="/audit" element={<AuditLogs />} />

              <Route path="/settings" element={<GeneralSettings />} />
              <Route path="/settings/departments" element={<Departments />} />

              <Route path="/subscription" element={<SubscriptionPlans />} />
              <Route path="/subscription/tenants" element={<TenantManagement />} />

              <Route path="/patient-portal" element={<PatientPortalDashboard />} />
              <Route path="/patient-portal/reports" element={<PatientPortalReports />} />

              <Route path="/doctor-portal" element={<DoctorPortalDashboard />} />

              <Route path="/mobile-apps" element={<MobileApps />} />

              <Route path="/ai-features" element={<AiFeatures />} />
            </Route>
            </Route>

            <Route path="*" element={<Navigate to="/not-found" replace />} />
            <Route path="/not-found" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  )
}
