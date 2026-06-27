import { NavLink } from "react-router-dom"
import {
  LayoutDashboard, Users, Shield, Building2,
  Beaker, ClipboardList, FlaskConical, Microscope,   FileText,
  DollarSign, Package, Bell, BarChart3, CircleHelp, BookMarked, LayoutDashboard,
  ShieldCheck, Settings, CreditCard, ChevronLeft,
  ChevronRight, Dna, Wrench, BookOpen,
  ClipboardPen, CalendarCheck, GitBranch, Activity,
  Clock, ListOrdered, AlertTriangle, Repeat, ShoppingCart,
  Receipt, DollarSignIcon, BadgePercent, Percent, RefreshCw,
  Grid3x3, Megaphone, Bot, Send, Gauge,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useUIStore } from "@/store/uiStore"
import { useAuthStore } from "@/store/authStore"
import { Button } from "@/shared/ui/button"
import { ScrollArea } from "@/shared/ui/scroll-area"
import type { UserRole } from "@/types"

interface NavItem {
  label: string
  icon: React.ElementType
  href: string
  roles?: UserRole[]
}

interface NavCategory {
  label: string
  items: NavItem[]
}

const navCategories: NavCategory[] = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    ],
  },
  {
    label: "Administration",
    items: [
      { label: "Users", icon: Users, href: "/users" },
      { label: "Roles & Permissions", icon: Shield, href: "/roles" },
      { label: "Institutions", icon: Building2, href: "/institutions" },
      { label: "Settings", icon: Settings, href: "/settings" },
    ],
  },
  {
    label: "Facilities",
    items: [
      { label: "Facilities", icon: Building2, href: "/facilities" },
      { label: "Instruments", icon: Dna, href: "/instruments" },
      { label: "Assets", icon: Package, href: "/assets" },
      { label: "Maintenance", icon: Wrench, href: "/maintenance" },
    ],
  },
  {
    label: "Operations",
    items: [
      { label: "Training", icon: BookOpen, href: "/training" },
      { label: "Competency Matrix", icon: Grid3x3, href: "/training/matrix" },
      { label: "Help Center", icon: CircleHelp, href: "/help" },
      { label: "Publications", icon: BookMarked, href: "/publications" },
      { label: "Announcements", icon: Megaphone, href: "/announcements" },
      { label: "Homepage Builder", icon: LayoutDashboard, href: "/admin/homepage" },
      { label: "Booking Calendar", icon: CalendarCheck, href: "/scheduler/calendar" },
      { label: "My Bookings", icon: BookOpen, href: "/scheduler/bookings" },
      { label: "Availability", icon: Clock, href: "/scheduler/availability" },
      { label: "Constraints", icon: ShieldCheck, href: "/scheduler/constraints" },
      { label: "Recurring Rules", icon: Repeat, href: "/scheduler/recurring-rules" },
      { label: "Waitlist", icon: ListOrdered, href: "/scheduler/waitlist" },
      { label: "Conflicts", icon: AlertTriangle, href: "/scheduler/conflicts" },
      { label: "Requests", icon: ClipboardPen, href: "/requests" },
      { label: "Workflows", icon: GitBranch, href: "/workflows" },
      { label: "Projects", icon: BookOpen, href: "/projects" },
      { label: "Inventory Dashboard", icon: Package, href: "/inventory" },
      { label: "Item Catalog", icon: Package, href: "/inventory/items" },
      { label: "Purchase Orders", icon: ShoppingCart, href: "/inventory/purchase-orders" },
      { label: "Vendors", icon: Building2, href: "/inventory/vendors" },
    ],
  },
  {
    label: "Finance",
    items: [
      { label: "Invoices", icon: Receipt, href: "/billing/invoices" },
      { label: "Pricing Models", icon: DollarSign, href: "/billing/pricing-models" },
      { label: "Rebates", icon: BadgePercent, href: "/billing/rebates" },
      { label: "Credits", icon: CreditCard, href: "/billing/credits" },
      { label: "Tax Codes", icon: Percent, href: "/billing/tax-codes" },
      { label: "Exchange Rates", icon: Repeat, href: "/billing/exchange-rates" },
      { label: "Reconciliation", icon: ListOrdered, href: "/billing/reconciliation" },
      { label: "ERP Sync", icon: RefreshCw, href: "/billing/erp-sync" },
      { label: "Reports", icon: FileText, href: "/billing/reports" },
    ],
  },
  {
    label: "Analytics",
    items: [
      { label: "Dashboards", icon: BarChart3, href: "/billing/analytics" },
    ],
  },
  {
    label: "AI Modules",
    items: [
      { label: "Helpdesk Chat", icon: Bot, href: "/ai/helpdesk" },
      { label: "SLA Dashboard", icon: BarChart3, href: "/ai/sla-dashboard" },
      { label: "Talk to Action", icon: Send, href: "/ai/talk-to-action" },
      { label: "Action History", icon: Clock, href: "/ai/action-history" },
      { label: "Equipment FAQ", icon: FileText, href: "/ai/equipment-faq" },
      { label: "SOP Viewer", icon: BookOpen, href: "/ai/sop-viewer" },
      { label: "IoT Dashboard", icon: Activity, href: "/ai/iot" },
      { label: "IoT Alerts", icon: Bell, href: "/ai/iot/alerts" },
      { label: "Automation Rules", icon: Gauge, href: "/ai/iot/automation" },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Notifications", icon: Bell, href: "/notifications" },
      { label: "Audit Logs", icon: ShieldCheck, href: "/compliance/audit-logs" },
      { label: "Subscription", icon: CreditCard, href: "/subscription" },
    ],
  },
]

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUIStore()
  const { user } = useAuthStore()

  const filteredCategories = navCategories
    .map((cat) => ({
      ...cat,
      items: cat.items.filter(
        (item) => !item.roles || (user && item.roles.some(r => user.role.includes(r)))
      ),
    }))
    .filter((cat) => cat.items.length > 0)

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-sidebar-border bg-sidebar-background transition-all duration-300",
        sidebarCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-14 items-center px-4 border-b border-sidebar-divider">
        <div className={cn("flex items-center gap-2.5", sidebarCollapsed && "justify-center w-full")}>
          {!sidebarCollapsed && (
            <>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs font-bold">
                R
              </div>
              <span className="text-sm font-semibold text-sidebar-primary">Research LMS</span>
            </>
          )}
          {sidebarCollapsed && (
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs font-bold">
              R
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={toggleSidebar}
          className={cn("ml-auto text-muted-foreground/50 hover:text-foreground", sidebarCollapsed && "hidden")}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 py-3">
        <nav className="px-2">
          {filteredCategories.map((category) => (
            <div key={category.label} className="mb-4">
              {!sidebarCollapsed && (
                <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40">
                  {category.label}
                </p>
              )}
              <div className="space-y-0.5">
                {category.items.map((item) => (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-150",
                        "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                          : "text-sidebar-foreground/80 hover:text-sidebar-foreground",
                        sidebarCollapsed && "justify-center px-2"
                      )
                    }
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </ScrollArea>

      {sidebarCollapsed && (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={toggleSidebar}
          className="absolute -right-3 top-[13px] h-6 w-6 rounded-full border border-sidebar-border bg-sidebar-background shadow-sm hover:shadow-md"
        >
          <ChevronRight className="h-3 w-3" />
        </Button>
      )}
    </aside>
  )
}
