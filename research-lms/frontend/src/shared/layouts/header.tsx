import { Bell, Moon, Sun, LogOut, User, Settings, ChevronDown, ChevronRight, Home } from "lucide-react"
import { useAuthStore } from "@/store/authStore"
import { useUIStore } from "@/store/uiStore"
import { Button } from "@/shared/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu"
import { useNavigate, Link } from "react-router-dom"
import { cn } from "@/lib/utils"
import GlobalSearch from "@/shared/components/global-search"

export function Header() {
  const { user, logout } = useAuthStore()
  const { theme, setTheme, breadcrumbs } = useUIStore()
  const navigate = useNavigate()

  const initials = user?.fullName
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const roleLabel = user?.role?.[0]?.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-border/50 bg-background/80 backdrop-blur-sm px-4 lg:px-6">
      {breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground/70">
          <Link to="/dashboard" className="hover:text-foreground transition-colors">
            <Home className="h-3.5 w-3.5" />
          </Link>
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1.5">
              <ChevronRight className="h-3 w-3 text-muted-foreground/40" />
              {crumb.href ? (
                <Link
                  to={crumb.href}
                  className={cn(
                    "hover:text-foreground transition-colors",
                    i === breadcrumbs.length - 1 && "font-medium text-foreground"
                  )}
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className={cn(i === breadcrumbs.length - 1 && "font-medium text-foreground")}>
                  {crumb.label}
                </span>
              )}
            </span>
          ))}
        </nav>
      )}
      <div className="flex-1" />

      <GlobalSearch />

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="text-muted-foreground/60 hover:text-foreground"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        <Button variant="ghost" size="icon-sm" className="relative text-muted-foreground/60 hover:text-foreground" onClick={() => navigate("/notifications")}>
          <Bell className="h-4 w-4" />
          <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-destructive text-[9px] font-semibold text-destructive-foreground">
            3
          </span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2.5 px-2.5 ml-1">
              <Avatar className="h-7 w-7 ring-1 ring-border">
                <AvatarImage src={user?.avatarUrl} />
                <AvatarFallback className="text-[11px] font-medium">{initials}</AvatarFallback>
              </Avatar>
              <div className="hidden text-left md:block">
                <p className="text-xs font-medium leading-none text-foreground">{user?.fullName}</p>
                <p className="text-[10px] text-muted-foreground/60">{roleLabel}</p>
              </div>
              <ChevronDown className="hidden h-3 w-3 text-muted-foreground/40 md:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">{user?.fullName}</span>
                <span className="text-xs font-normal text-muted-foreground/70">{user?.email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/settings")}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/users")}>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
