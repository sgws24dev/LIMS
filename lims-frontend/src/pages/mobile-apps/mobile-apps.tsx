"use client"

import { useState } from "react"
import {
  Smartphone,
  Download,
  CheckCircle2,
  ArrowRight,
  Star,
  MapPin,
  Route,
  User,
  BarChart3,
  FileText,
  Calendar,
  Bell,
  CreditCard,
  Syringe,
  Package,
  QrCode,
  ChevronRight,
  Layers,
  Users,
  IndianRupee,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageHeader } from "@/components/ui/page-header"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"

interface AppFeature {
  icon: React.ReactNode
  title: string
  description: string
}

interface AppScreenshot {
  name: string
  icon: React.ReactNode
  color: string
}

interface AppData {
  id: string
  name: string
  tagline: string
  description: string
  gradient: string
  icon: React.ReactNode
  features: AppFeature[]
  screenshots: AppScreenshot[]
  rating: number
  downloads: string
}

const patientApp: AppData = {
  id: "patient",
  name: "Patient App",
  tagline: "Your Health, At Your Fingertips",
  description: "Book tests, view reports, track family health, and get AI-powered insights - all from your phone.",
  gradient: "from-emerald-500 to-teal-600",
  icon: <Smartphone className="h-6 w-6" />,
  features: [
    { icon: <Calendar className="h-5 w-5" />, title: "Book Tests", description: "Schedule lab tests with home collection option" },
    { icon: <FileText className="h-5 w-5" />, title: "View Reports", description: "Access all your reports with AI summaries" },
    { icon: <Users className="h-5 w-5" />, title: "Family Management", description: "Manage health records for your whole family" },
    { icon: <Bell className="h-5 w-5" />, title: "Smart Notifications", description: "Get report ready & appointment reminders" },
    { icon: <QrCode className="h-5 w-5" />, title: "Report Verification", description: "Scan QR to verify report authenticity" },
    { icon: <CreditCard className="h-5 w-5" />, title: "Easy Payments", description: "Pay online with multiple payment options" },
  ],
  screenshots: [
    { name: "Dashboard", icon: <Layers className="h-8 w-8" />, color: "bg-emerald-500" },
    { name: "Book Test", icon: <Calendar className="h-8 w-8" />, color: "bg-teal-500" },
    { name: "Reports", icon: <FileText className="h-8 w-8" />, color: "bg-emerald-600" },
    { name: "Profile", icon: <User className="h-8 w-8" />, color: "bg-teal-600" },
  ],
  rating: 4.7,
  downloads: "50K+",
}

const doctorApp: AppData = {
  id: "doctor",
  name: "Doctor App",
  tagline: "Track Referrals, Grow Practice",
  description: "Monitor patient referrals, access reports, and track your commission in real-time.",
  gradient: "from-blue-500 to-indigo-600",
  icon: <Smartphone className="h-6 w-6" />,
  features: [
    { icon: <Users className="h-5 w-5" />, title: "Referral Tracking", description: "Real-time view of all referred patients" },
    { icon: <FileText className="h-5 w-5" />, title: "Test Reports", description: "View and download patient test reports" },
    { icon: <BarChart3 className="h-5 w-5" />, title: "Analytics", description: "Monthly trends, top tests, revenue insights" },
    { icon: <IndianRupee className="h-5 w-5" />, title: "Commission Dashboard", description: "Track earnings and commission statements" },
    { icon: <Bell className="h-5 w-5" />, title: "Report Alerts", description: "Instant notifications when reports are ready" },
    { icon: <User className="h-5 w-5" />, title: "Digital Profile", description: "Showcase specialization and patient reviews" },
  ],
  screenshots: [
    { name: "Dashboard", icon: <Layers className="h-8 w-8" />, color: "bg-blue-500" },
    { name: "Referrals", icon: <Users className="h-8 w-8" />, color: "bg-indigo-500" },
    { name: "Reports", icon: <FileText className="h-8 w-8" />, color: "bg-blue-600" },
    { name: "Analytics", icon: <BarChart3 className="h-8 w-8" />, color: "bg-indigo-600" },
  ],
  rating: 4.8,
  downloads: "10K+",
}

const phlebotomistApp: AppData = {
  id: "phlebo",
  name: "Phlebotomist App",
  tagline: "Streamline Your Collection Route",
  description: "Manage collection queues, track samples, navigate routes, and update statuses on the go.",
  gradient: "from-purple-500 to-pink-600",
  icon: <Smartphone className="h-6 w-6" />,
  features: [
    { icon: <Layers className="h-5 w-5" />, title: "Collection Queue", description: "View today's assigned collections in order" },
    { icon: <Route className="h-5 w-5" />, title: "Route Optimization", description: "Smart route planning for home collections" },
    { icon: <Package className="h-5 w-5" />, title: "Sample Tracking", description: "Scan barcodes and update collection status" },
    { icon: <MapPin className="h-5 w-5" />, title: "GPS Navigation", description: "Integrated maps to patient locations" },
    { icon: <Syringe className="h-5 w-5" />, title: "Kit Management", description: "Track collection kit inventory and usage" },
    { icon: <User className="h-5 w-5" />, title: "Digital Profile", description: "View schedule, performance stats, and earnings" },
  ],
  screenshots: [
    { name: "Queue", icon: <Layers className="h-8 w-8" />, color: "bg-purple-500" },
    { name: "Tracking", icon: <Package className="h-8 w-8" />, color: "bg-pink-500" },
    { name: "Route", icon: <Route className="h-8 w-8" />, color: "bg-purple-600" },
    { name: "Profile", icon: <User className="h-8 w-8" />, color: "bg-pink-600" },
  ],
  rating: 4.6,
  downloads: "5K+",
}

function PhoneFrame({ screenshots, gradient }: { screenshots: AppScreenshot[]; gradient: string }) {
  const [activeScreen, setActiveScreen] = useState(0)

  return (
    <div className="relative mx-auto w-[240px]">
      <div className="relative rounded-[2rem] border-4 border-foreground/20 bg-background p-3 shadow-2xl">
        <div className="absolute left-1/2 top-0 z-10 h-5 w-24 -translate-x-1/2 rounded-b-xl bg-foreground/20" />
        <div className="overflow-hidden rounded-2xl">
          <div className="flex aspect-[9/19] flex-col">
            <div className="flex items-center justify-between px-4 py-2 text-[10px] font-medium">
              <span>9:41</span>
              <div className="flex items-center gap-1">
                <div className="h-2 w-4 rounded-sm border border-current" />
                <span className="text-xs">5G</span>
              </div>
            </div>
            <div className={cn("flex flex-1 flex-col items-center justify-center gap-3 px-4 bg-gradient-to-b", gradient)}>
              <div className="rounded-2xl bg-white/20 p-4 backdrop-blur-sm">
                {screenshots[activeScreen].icon}
              </div>
              <p className="text-center text-sm font-semibold text-white">
                {screenshots[activeScreen].name}
              </p>
              <div className="flex gap-1.5">
                {screenshots.map((_, idx) => (
                  <button
                    key={idx}
                    className={cn(
                      "h-1.5 rounded-full transition-all",
                      idx === activeScreen ? "w-4 bg-white" : "w-1.5 bg-white/40"
                    )}
                    onClick={() => setActiveScreen(idx)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-3 flex justify-center gap-2">
        {screenshots.map((s, idx) => (
          <button
            key={s.name}
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors",
              idx === activeScreen
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:bg-accent"
            )}
            onClick={() => setActiveScreen(idx)}
          >
            {s.name}
          </button>
        ))}
      </div>
    </div>
  )
}

function AppSection({ app, index }: { app: AppData; index: number }) {
  const { toast } = useToast()

  const handleDownload = (store: string) => {
    toast({ title: `${app.name} - ${store}`, description: `Redirecting to ${store} store...`, variant: "default" })
  }

  const colorClass = index === 0 ? "text-emerald-600" : index === 1 ? "text-blue-600" : "text-purple-600"
  const bgLightClass = index === 0 ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30" : index === 1 ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30" : "bg-purple-100 text-purple-600 dark:bg-purple-900/30"

  return (
    <section className={cn("space-y-8", index > 0 && "pt-12")}>
      {index > 0 && <Separator />}
      <div className={cn("flex items-center gap-3", colorClass)}>
        <div className={cn("rounded-lg p-2.5 bg-gradient-to-br", app.gradient, "text-white")}>
          {app.icon}
        </div>
        <div>
          <h2 className="text-2xl font-bold">{app.name}</h2>
          <p className="text-sm text-muted-foreground">{app.tagline}</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <PhoneFrame screenshots={app.screenshots} gradient={app.gradient} />
        </div>

        <div className="lg:col-span-3 space-y-6">
          <p className="text-lg text-muted-foreground">{app.description}</p>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-4 w-4",
                      i < Math.round(app.rating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground"
                    )}
                  />
                ))}
              </div>
              <span className="text-sm font-medium">{app.rating}</span>
            </div>
            <span className="text-sm text-muted-foreground">{app.downloads} downloads</span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {app.features.map((feature) => (
              <div key={feature.title} className="flex items-start gap-3 rounded-lg border p-3">
                <div className={cn("mt-0.5 rounded-lg p-1.5", bgLightClass)}>
                  {feature.icon}
                </div>
                <div>
                  <p className="text-sm font-medium">{feature.title}</p>
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <Button size="lg" onClick={() => handleDownload("App Store")} className={cn("bg-gradient-to-r", app.gradient, "text-white hover:opacity-90")}>
              <Download className="mr-2 h-5 w-5" />
              App Store
            </Button>
            <Button size="lg" variant="outline" onClick={() => handleDownload("Google Play")}>
              <Download className="mr-2 h-5 w-5" />
              Google Play
            </Button>
            <Button size="lg" variant="ghost">
              Learn More <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function MobileApps() {
  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Mobile Apps"
        description="Download our mobile apps for a seamless healthcare experience"
      />

      <Card className="bg-gradient-to-r from-primary/5 to-transparent border-primary/10">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
            <div className="rounded-2xl bg-gradient-to-br from-primary to-primary/60 p-4 text-white shadow-lg">
              <Smartphone className="h-12 w-12" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">One Platform, Three Apps</h2>
              <p className="mt-1 text-muted-foreground">
                Designed for patients, doctors, and phlebotomists - each app is tailored to your specific needs.
              </p>
            </div>
            <div className="flex gap-2">
              <Badge variant="success" className="rounded-full px-4 py-1 text-sm">
                <CheckCircle2 className="mr-1 h-4 w-4" />
                4.7 Avg Rating
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <AppSection app={patientApp} index={0} />
      <AppSection app={doctorApp} index={1} />
      <AppSection app={phlebotomistApp} index={2} />

      <Card className="border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <Smartphone className="h-10 w-10 text-primary" />
          <div>
            <h3 className="text-lg font-bold">Get Started Today</h3>
            <p className="text-sm text-muted-foreground">
              Download the app that matches your role and experience the future of diagnostic healthcare.
            </p>
          </div>
          <div className="flex gap-3">
            <Button>Download Patient App</Button>
            <Button variant="outline">Doctor App</Button>
            <Button variant="outline">Phlebotomist App</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
