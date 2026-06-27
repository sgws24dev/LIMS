import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from '@/shared/auth/protected-route'
import { AppLayout } from '@/shared/layouts/app-layout'

import LoginPage from '@/modules/auth/pages/login-page'
import ForgotPasswordPage from '@/modules/auth/pages/forgot-password-page'
import ResetPasswordPage from '@/modules/auth/pages/reset-password-page'
import MfaPage from '@/modules/auth/pages/mfa-page'
import DashboardRouter from '@/modules/dashboard/pages/dashboard-router'
import UsersList from '@/modules/users/pages/users-list'
import CreateUserPage from '@/modules/users/pages/create-user'
import EditUserPage from '@/modules/users/pages/edit-user'
import UserDetailsPage from '@/modules/users/pages/user-details'
import RolesList from '@/modules/roles/pages/roles-list'
import CreateRolePage from '@/modules/roles/pages/create-role'
import EditRolePage from '@/modules/roles/pages/edit-role'
import RoleDetailsPage from '@/modules/roles/pages/role-details'
import PermissionMatrix from '@/modules/roles/pages/permission-matrix'
import InstitutionsList from '@/modules/institutions/pages/institutions-list'
import CreateInstitutionPage from '@/modules/institutions/pages/create-institution'
import EditInstitutionPage from '@/modules/institutions/pages/edit-institution'
import FacilitiesList from '@/modules/facilities/pages/facilities-list'
import CreateFacilityPage from '@/modules/facilities/pages/create-facility'
import EditFacilityPage from '@/modules/facilities/pages/edit-facility'
import FacilityDetailsPage from '@/modules/facilities/pages/facility-details'
import RoomUtilizationPage from '@/modules/facilities/pages/room-utilization'
import AssetsList from '@/modules/facilities/pages/assets-list'
import CreateAssetPage from '@/modules/facilities/pages/create-asset'
import EditAssetPage from '@/modules/facilities/pages/edit-asset'
import AssetDetailsPage from '@/modules/facilities/pages/asset-details'
import AssetDepreciationPage from '@/modules/facilities/pages/asset-depreciation'
import InstrumentsListPage from '@/modules/facilities/pages/instruments-list'
import InstrumentDetailsPage from '@/modules/facilities/pages/instrument-details'
import InstrumentConfigPage from '@/modules/facilities/pages/instrument-config'
import InstrumentDashboardPage from '@/modules/facilities/pages/instrument-dashboard'
import MaintenanceCalendarPage from '@/modules/facilities/pages/maintenance-calendar'
import CalibrationRecordsPage from '@/modules/facilities/pages/calibration-records'
import SchedulerCalendar from '@/modules/scheduler/pages/scheduler-calendar'
import CreateBookingWizard from '@/modules/scheduler/pages/create-booking-wizard'
import SchedulerAvailability from '@/modules/scheduler/pages/scheduler-availability'
import SchedulerConstraints from '@/modules/scheduler/pages/scheduler-constraints'
import SchedulerWaitlist from '@/modules/scheduler/pages/scheduler-waitlist'
import SchedulerConflicts from '@/modules/scheduler/pages/scheduler-conflicts'
import BookingsList from '@/modules/scheduler/pages/bookings-list'
import BookingDetails from '@/modules/scheduler/pages/booking-details'
import RecurringRulesPage from '@/modules/scheduler/pages/recurring-rules-page'
import RecurringRuleDetail from '@/modules/scheduler/pages/recurring-rule-detail'
import CalendarSyncSettings from '@/modules/scheduler/pages/calendar-sync-settings'
import OAuthCallback from '@/modules/scheduler/pages/oauth-callback'
import TrainerAvailability from '@/modules/scheduler/pages/trainer-availability'
import MyBookings from '@/modules/scheduler/pages/my-bookings'
import FormListPage from '@/modules/requests/pages/forms-list'
import FormBuilderPage from '@/modules/requests/pages/form-builder'
import SubmitRequestPage from '@/modules/requests/pages/submit-request'
import RequestsListPage from '@/modules/requests/pages/requests-list'
import RequestDetailsPage from '@/modules/requests/pages/request-details'
import ApprovalsDashboardPage from '@/modules/requests/pages/approvals-dashboard'
import WorkflowDefinitionsListPage from '@/modules/workflow/pages/workflow-definitions-list'
import WorkflowDesignerPage from '@/modules/workflow/pages/workflow-designer'
import WorkflowInstanceView from '@/modules/workflow/components/workflow-instance-view'

import ProjectsDashboardPage from '@/modules/projects/pages/projects-dashboard'
import ProjectsListPage from '@/modules/projects/pages/projects-list'
import ProjectDetailsPage from '@/modules/projects/pages/project-details'
import WorkOrdersPage from '@/modules/projects/pages/work-orders-page'
import CostCentersPage from '@/modules/projects/pages/cost-centers-page'
import IssuesListPage from '@/modules/issues/pages/issues-list'
import CreateIssuePage from '@/modules/issues/pages/create-issue'
import IssueDetailsPage from '@/modules/issues/pages/issue-details'

import InventoryDashboardPage from '@/modules/inventory/pages/inventory-dashboard'
import ItemCatalogPage from '@/modules/inventory/pages/item-catalog'
import ItemDetailsPage from '@/modules/inventory/pages/item-details'
import InventoryItemFormPage from '@/modules/inventory/pages/inventory-item-form'
import StockLedgerPage from '@/modules/inventory/pages/stock-ledger'
import PurchaseOrdersPage from '@/modules/inventory/pages/purchase-orders'
import VendorDirectoryPage from '@/modules/inventory/pages/vendor-directory'
import VendorDetailsPage from '@/modules/inventory/pages/vendor-details'

import InvoicesListPage from '@/modules/billing/pages/invoices-list'
import InvoiceDetailsPage from '@/modules/billing/pages/invoice-details'
import CreateInvoicePage from '@/modules/billing/pages/create-invoice'
import PricingModelsPage from '@/modules/billing/pages/pricing-models-page'
import RateEditorPage from '@/modules/billing/pages/rate-editor'
import RebatesPage from '@/modules/billing/pages/rebates-page'
import CreditsPage from '@/modules/billing/pages/credits-page'
import TaxCodesPage from '@/modules/billing/pages/tax-codes-page'
import ErpSyncDashboardPage from '@/modules/billing/pages/erp-sync-dashboard'
import ExchangeRatesPage from '@/modules/billing/pages/exchange-rates-page'
import ReconciliationPage from '@/modules/billing/pages/reconciliation-page'
import FinancialDashboardPage from '@/modules/billing/pages/financial-dashboard'
import DepreciationReportsPage from '@/modules/billing/pages/depreciation-reports'
import AnalyticsHomePage from '@/modules/billing/pages/analytics-home'
import DashboardDetailPage from '@/modules/billing/pages/dashboard-detail'
import ReportsPage from '@/modules/billing/pages/reports-page'

import AuditLogsPage from '@/modules/compliance/pages/audit-logs-page'
import TrainingDashboard from '@/modules/training/pages/TrainingDashboard'
import CompetencyMatrix from '@/modules/training/pages/CompetencyMatrix'

import NotificationCenter from '@/modules/notifications/pages/NotificationCenter'
import NotificationPreferences from '@/modules/notifications/pages/NotificationPreferences'
import EmailTemplateEditor from '@/modules/admin/pages/EmailTemplateEditor'
import SmsTemplateEditor from '@/modules/admin/pages/SmsTemplateEditor'
import AnnouncementsList from '@/modules/announcements/pages/AnnouncementsList'
import CreateAnnouncement from '@/modules/announcements/pages/CreateAnnouncement'

import HelpCenter from '@/modules/help/pages/HelpCenter'
import HelpArticleDetail from '@/modules/help/pages/HelpArticleDetail'

import PublicationsList from '@/modules/publications/pages/PublicationsList'
import AddPublication from '@/modules/publications/pages/AddPublication'
import PublicationDetails from '@/modules/publications/pages/PublicationDetails'
import HomepageBuilder from '@/modules/admin/pages/HomepageBuilder'

import HelpdeskChat from '@/modules/ai-modules/pages/HelpdeskChat'
import HelpdeskSlaDashboard from '@/modules/ai-modules/pages/HelpdeskSlaDashboard'
import TalkToAction from '@/modules/ai-modules/pages/TalkToAction'
import ActionHistory from '@/modules/ai-modules/pages/ActionHistory'
import EquipmentFaq from '@/modules/ai-modules/pages/EquipmentFaq'
import SopViewer from '@/modules/ai-modules/pages/SopViewer'
import IoTDashboard from '@/modules/ai-modules/pages/IoTDashboard'
import IoTAlerts from '@/modules/ai-modules/pages/IoTAlerts'
import AutomationRules from '@/modules/ai-modules/pages/AutomationRules'

import SettingsPage from '@/modules/settings/pages/settings-page'
import NotFoundPage from '@/modules/settings/pages/not-found-page'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/mfa" element={<MfaPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardRouter />} />

          <Route path="/users" element={<UsersList />} />
          <Route path="/users/create" element={<CreateUserPage />} />
          <Route path="/users/:id/edit" element={<EditUserPage />} />
          <Route path="/users/:id" element={<UserDetailsPage />} />

          <Route path="/roles" element={<RolesList />} />
          <Route path="/roles/create" element={<CreateRolePage />} />
          <Route path="/roles/:id/edit" element={<EditRolePage />} />
          <Route path="/roles/:id" element={<RoleDetailsPage />} />
          <Route path="/roles/permission-matrix" element={<PermissionMatrix />} />

          <Route path="/institutions" element={<InstitutionsList />} />
          <Route path="/institutions/create" element={<CreateInstitutionPage />} />
          <Route path="/institutions/:id/edit" element={<EditInstitutionPage />} />

          <Route path="/facilities" element={<FacilitiesList />} />
          <Route path="/facilities/create" element={<CreateFacilityPage />} />
          <Route path="/facilities/:id/edit" element={<EditFacilityPage />} />
          <Route path="/facilities/:id" element={<FacilityDetailsPage />} />
          <Route path="/facilities/room-utilization" element={<RoomUtilizationPage />} />

          <Route path="/facilities/assets" element={<AssetsList />} />
          <Route path="/facilities/assets/create" element={<CreateAssetPage />} />
          <Route path="/facilities/assets/:id/edit" element={<EditAssetPage />} />
          <Route path="/facilities/assets/:id" element={<AssetDetailsPage />} />
          <Route path="/facilities/assets/:id/depreciation" element={<AssetDepreciationPage />} />

          <Route path="/facilities/instruments" element={<InstrumentsListPage />} />
          <Route path="/facilities/instruments/dashboard" element={<InstrumentDashboardPage />} />
          <Route path="/facilities/instruments/:id" element={<InstrumentDetailsPage />} />
          <Route path="/facilities/instruments/:id/config" element={<InstrumentConfigPage />} />

          <Route path="/facilities/maintenance" element={<MaintenanceCalendarPage />} />

          <Route path="/facilities/calibration" element={<CalibrationRecordsPage />} />

          <Route path="/scheduler/calendar" element={<SchedulerCalendar />} />
          <Route path="/scheduler/book" element={<CreateBookingWizard />} />
          <Route path="/scheduler/availability" element={<SchedulerAvailability />} />
          <Route path="/scheduler/constraints" element={<SchedulerConstraints />} />
          <Route path="/scheduler/waitlist" element={<SchedulerWaitlist />} />
          <Route path="/scheduler/conflicts" element={<SchedulerConflicts />} />
          <Route path="/scheduler/bookings" element={<BookingsList />} />
          <Route path="/scheduler/bookings/:id" element={<BookingDetails />} />
          <Route path="/scheduler/bookings/:id/edit" element={<CreateBookingWizard />} />
          <Route path="/scheduler/recurring-rules" element={<RecurringRulesPage />} />
          <Route path="/scheduler/recurring-rules/:id" element={<RecurringRuleDetail />} />
          <Route path="/scheduler/calendar-sync" element={<CalendarSyncSettings />} />
          <Route path="/scheduler/calendar-sync/callback" element={<OAuthCallback />} />
          <Route path="/scheduler/trainer-availability" element={<TrainerAvailability />} />
          <Route path="/scheduler/my-bookings" element={<MyBookings />} />

          <Route path="/requests/forms" element={<FormListPage />} />
          <Route path="/requests/forms/new" element={<FormBuilderPage />} />
          <Route path="/requests/forms/:id" element={<FormBuilderPage />} />
          <Route path="/requests/submit" element={<SubmitRequestPage />} />
          <Route path="/requests/submit/:formId" element={<SubmitRequestPage />} />
          <Route path="/requests" element={<RequestsListPage />} />
          <Route path="/requests/:id" element={<RequestDetailsPage />} />
          <Route path="/approvals" element={<ApprovalsDashboardPage />} />

          <Route path="/workflow/definitions" element={<WorkflowDefinitionsListPage />} />
          <Route path="/workflow/designer/new" element={<WorkflowDesignerPage />} />
          <Route path="/workflow/designer/:id" element={<WorkflowDesignerPage />} />
          <Route path="/workflow/instances/:entityType/:entityId" element={<WorkflowInstanceView />} />

          <Route path="/projects" element={<ProjectsDashboardPage />} />
          <Route path="/projects/list" element={<ProjectsListPage />} />
          <Route path="/projects/:id" element={<ProjectDetailsPage />} />
          <Route path="/projects/work-orders" element={<WorkOrdersPage />} />
          <Route path="/projects/:projectId/work-orders" element={<WorkOrdersPage />} />
          <Route path="/projects/cost-centers" element={<CostCentersPage />} />

          <Route path="/issues" element={<IssuesListPage />} />
          <Route path="/issues/new" element={<CreateIssuePage />} />
          <Route path="/issues/:id" element={<IssueDetailsPage />} />

          <Route path="/inventory" element={<InventoryDashboardPage />} />
          <Route path="/inventory/items" element={<ItemCatalogPage />} />
          <Route path="/inventory/items/new" element={<InventoryItemFormPage />} />
          <Route path="/inventory/items/:id" element={<ItemDetailsPage />} />
          <Route path="/inventory/items/:id/edit" element={<ItemDetailsPage />} />
          <Route path="/inventory/items/:id/ledger" element={<StockLedgerPage />} />
          <Route path="/inventory/purchase-orders" element={<PurchaseOrdersPage />} />
          <Route path="/inventory/vendors" element={<VendorDirectoryPage />} />
          <Route path="/inventory/vendors/:id" element={<VendorDetailsPage />} />

          <Route path="/billing/invoices" element={<InvoicesListPage />} />
          <Route path="/billing/invoices/new" element={<CreateInvoicePage />} />
          <Route path="/billing/invoices/:id" element={<InvoiceDetailsPage />} />
          <Route path="/billing/pricing-models" element={<PricingModelsPage />} />
          <Route path="/billing/pricing-models/:pricingModelId/rates" element={<RateEditorPage />} />
          <Route path="/billing/rebates" element={<RebatesPage />} />
          <Route path="/billing/credits" element={<CreditsPage />} />
          <Route path="/billing/tax-codes" element={<TaxCodesPage />} />
          <Route path="/billing/erp-sync" element={<ErpSyncDashboardPage />} />
          <Route path="/billing/exchange-rates" element={<ExchangeRatesPage />} />
          <Route path="/billing/reconciliation" element={<ReconciliationPage />} />
          <Route path="/billing/depreciation-reports" element={<DepreciationReportsPage />} />
          <Route path="/billing/analytics" element={<AnalyticsHomePage />} />
          <Route path="/billing/analytics/:id" element={<DashboardDetailPage />} />
          <Route path="/billing/reports" element={<ReportsPage />} />
          <Route path="/billing" element={<FinancialDashboardPage />} />

          <Route path="/compliance/audit-logs" element={<AuditLogsPage />} />

          <Route path="/training" element={<TrainingDashboard />} />
          <Route path="/training/matrix" element={<CompetencyMatrix />} />

          <Route path="/notifications" element={<NotificationCenter />} />
          <Route path="/settings/notifications" element={<NotificationPreferences />} />
          <Route path="/announcements" element={<AnnouncementsList />} />
          <Route path="/announcements/create" element={<CreateAnnouncement />} />
          <Route path="/announcements/:id/edit" element={<CreateAnnouncement />} />

          <Route path="/admin/notifications/templates/email" element={<EmailTemplateEditor />} />
          <Route path="/admin/notifications/templates/email/:id" element={<EmailTemplateEditor />} />
          <Route path="/admin/notifications/templates/sms" element={<SmsTemplateEditor />} />
          <Route path="/admin/notifications/templates/sms/:id" element={<SmsTemplateEditor />} />

          <Route path="/help" element={<HelpCenter />} />
          <Route path="/help/:slug" element={<HelpArticleDetail />} />

          <Route path="/publications" element={<PublicationsList />} />
          <Route path="/publications/add" element={<AddPublication />} />
          <Route path="/publications/:id" element={<PublicationDetails />} />
          <Route path="/publications/:id/edit" element={<AddPublication />} />

          <Route path="/admin/homepage" element={<HomepageBuilder />} />

          <Route path="/ai/helpdesk" element={<HelpdeskChat />} />
          <Route path="/ai/sla-dashboard" element={<HelpdeskSlaDashboard />} />
          <Route path="/ai/talk-to-action" element={<TalkToAction />} />
          <Route path="/ai/action-history" element={<ActionHistory />} />
          <Route path="/ai/equipment-faq" element={<EquipmentFaq />} />
          <Route path="/ai/sop-viewer" element={<SopViewer />} />
          <Route path="/ai/iot" element={<IoTDashboard />} />
          <Route path="/ai/iot/alerts" element={<IoTAlerts />} />
          <Route path="/ai/iot/automation" element={<AutomationRules />} />

          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/not-found" replace />} />
      <Route path="/not-found" element={<NotFoundPage />} />
    </Routes>
  )
}
