"use client"

import { NavLink } from "react-router-dom"
import {
  LayoutDashboard, Users, Shield, UserCircle, Stethoscope, Building2,
  Beaker, ClipboardList, FlaskConical, Microscope, FileText,
  DollarSign, Package, Building, Truck, Megaphone, Bell, BarChart3,
  ShieldCheck, Settings, CreditCard, Smartphone, Brain, ChevronLeft,
  ChevronRight, Dna, HeartPulse, TestTube,
  Barcode, GripVertical, TrendingUp,
  ClipboardPen,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAppStore } from "@/store/appStore"
import { useAuthStore } from "@/store/authStore"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { UserRole } from "@/types"

interface NavItem {
  label: string
  icon: React.ElementType
  href: string
  roles?: UserRole[]
  children?: { label: string; href: string }[]
}

interface NavCategory {
  label: string
  items: NavItem[]
}

const navCategories: NavCategory[] = [
  {
    label: "Overview",
    items: [
      {
        label: "Dashboard",
        icon: LayoutDashboard,
        href: "/dashboard",
        children: [
          { label: "Super Admin", href: "/dashboard/super-admin" },
          { label: "Lab Admin", href: "/dashboard/lab-admin" },
          { label: "Branch", href: "/dashboard/branch" },
          { label: "Technician", href: "/dashboard/technician" },
          { label: "Doctor", href: "/dashboard/doctor" },
        ],
      },
    ],
  },
  {
    label: "Master Data",
    items: [
      {
        label: "Users",
        icon: Users,
        href: "/users",
        roles: ["super_admin", "lab_admin"],
      },
      {
        label: "Roles & Permissions",
        icon: Shield,
        href: "/roles",
        roles: ["super_admin"],
      },
      {
        label: "Patients",
        icon: UserCircle,
        href: "/patients",
      },
      {
        label: "Doctors",
        icon: Stethoscope,
        href: "/doctors",
      },
      {
        label: "Branches",
        icon: Building2,
        href: "/branches",
        roles: ["super_admin", "lab_admin"],
      },
      {
        label: "Test Catalog",
        icon: Beaker,
        href: "/tests",
      },
    ],
  },
  {
    label: "Lab Operations",
    items: [
      {
        label: "Booking & Registration",
        icon: ClipboardList,
        href: "/bookings",
      },
      {
        label: "Sample Lifecycle",
        icon: Barcode,
        href: "/samples/tracking",
      },
      {
        label: "Lab Operations",
        icon: FlaskConical,
        href: "/lab-ops/technician-workbench",
      },
      {
        label: "Result Entry",
        icon: Microscope,
        href: "/results",
      },
      {
        label: "Pathologist Review",
        icon: ClipboardPen,
        href: "/pathologist/review",
      },
      {
        label: "Reports",
        icon: FileText,
        href: "/reports",
      },
      {
        label: "Instruments",
        icon: Dna,
        href: "/instruments/dashboard",
      },
      {
        label: "Quality Control",
        icon: TestTube,
        href: "/quality-control/dashboard",
      },
    ],
  },
  {
    label: "Business",
    items: [
      {
        label: "Billing & Finance",
        icon: DollarSign,
        href: "/billing",
      },
      {
        label: "Inventory",
        icon: Package,
        href: "/inventory",
      },
      {
        label: "Corporate & B2B",
        icon: Building,
        href: "/corporate",
      },
      {
        label: "Home Collection",
        icon: Truck,
        href: "/home-collection/calendar",
      },
      {
        label: "CRM & Marketing",
        icon: Megaphone,
        href: "/crm",
      },
    ],
  },
  {
    label: "Analytics",
    items: [
      {
        label: "Executive Dashboards",
        icon: TrendingUp,
        href: "/executive/revenue",
      },
      {
        label: "Analytics & BI",
        icon: BarChart3,
        href: "/analytics",
      },
    ],
  },
  {
    label: "System",
    items: [
      {
        label: "Notifications",
        icon: Bell,
        href: "/notifications",
      },
      {
        label: "Audit & Compliance",
        icon: ShieldCheck,
        href: "/audit",
      },
      {
        label: "Settings",
        icon: Settings,
        href: "/settings",
      },
      {
        label: "Subscription",
        icon: CreditCard,
        href: "/subscription",
        roles: ["super_admin"],
      },
      {
        label: "Mobile Apps",
        icon: Smartphone,
        href: "/mobile-apps",
      },
      {
        label: "AI Features",
        icon: Brain,
        href: "/ai-features",
      },
    ],
  },
  {
    label: "Portals",
    items: [
      {
        label: "Patient Portal",
        icon: HeartPulse,
        href: "/patient-portal",
        roles: ["patient"],
      },
      {
        label: "Doctor Portal",
        icon: Stethoscope,
        href: "/doctor-portal",
        roles: ["doctor"],
      },
    ],
  },
  {
    label: "Experimental",
    items: [
      {
        label: "Premium UX",
        icon: GripVertical,
        href: "/premium/kanban",
      },
    ],
  },
]

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useAppStore()
  const { user } = useAuthStore()

  const filteredCategories = navCategories
    .map((cat) => ({
      ...cat,
      items: cat.items.filter(
        (item) => !item.roles || (user && item.roles.includes(user.role as UserRole))
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
                P
              </div>
              <span className="text-sm font-semibold text-sidebar-primary">PathLIMS</span>
            </>
          )}
          {sidebarCollapsed && (
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs font-bold">
              P
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
                  <div key={item.href}>
                    <NavLink
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
                  </div>
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
