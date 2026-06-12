"use client"

import { useState, useMemo } from "react"
import {
  Megaphone,
  Star,
  Ticket,
  Plus,
  Mail,
  MessageSquare,
  Send,
  TrendingUp,
  Target,
  PauseCircle,
  PlayCircle,
  MoreHorizontal,
  Eye,
} from "lucide-react"
import type { Campaign, LoyaltyProgram, Coupon } from "@/mock/data/crm"
import { campaigns, loyaltyPrograms, coupons } from "@/mock/data/crm"
import { formatDate, formatCurrency } from "@/lib/utils"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { StatCard } from "@/components/ui/stat-card"
import { EmptyState } from "@/components/ui/empty-state"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts"

const campaignStatusStyles: Record<
  string,
  "default" | "secondary" | "destructive" | "success" | "warning"
> = {
  active: "success",
  draft: "secondary",
  completed: "default",
  cancelled: "destructive",
}

const channelIcons: Record<string, typeof Mail> = {
  sms: MessageSquare,
  email: Mail,
  whatsapp: Send,
  push: Send,
  offline: Megaphone,
}

const channelLabels: Record<string, string> = {
  sms: "SMS",
  email: "Email",
  whatsapp: "WhatsApp",
  push: "Push",
  offline: "Offline",
}

const typeLabels: Record<string, string> = {
  health_camp: "Health Camp",
  discount_offer: "Discount Offer",
  awareness: "Awareness",
  corporate_outreach: "Corporate Outreach",
  seasonal: "Seasonal",
}

export default function CampaignDashboard() {
  const { toast } = useToast()
  const [campaignsList, setCampaignsList] = useState(campaigns)
  const [createOpen, setCreateOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    type: "health_camp",
    channel: "sms",
    audience: "",
    message: "",
  })

  const stats = useMemo(() => {
    const active = campaignsList.filter((c) => c.status === "active").length
    const totalSent = campaignsList.reduce((s, c) => s + c.reachedCount, 0)
    const totalResponses = campaignsList.reduce(
      (s, c) => s + c.metrics.responses,
      0
    )
    const totalConversions = campaignsList.reduce(
      (s, c) => s + c.metrics.conversions,
      0
    )
    const responseRate =
      totalSent > 0 ? ((totalResponses / totalSent) * 100).toFixed(1) : "0"
    return {
      active,
      totalSent: totalSent.toLocaleString(),
      responseRate: `${responseRate}%`,
      conversions: totalConversions,
    }
  }, [campaignsList])

  const campaignCompareData = useMemo(() => {
    return campaignsList.map((c) => ({
      name: c.name.length > 15 ? c.name.slice(0, 15) + "..." : c.name,
      sent: c.reachedCount,
      responses: c.metrics.responses,
      conversions: c.metrics.conversions,
    }))
  }, [campaignsList])

  const responseTrendData = useMemo(() => {
    return campaignsList
      .filter((c) => c.status === "active" || c.status === "completed")
      .sort(
        (a, b) =>
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      )
      .map((c) => ({
        name: c.name.length > 12 ? c.name.slice(0, 12) + "..." : c.name,
        rate:
          c.reachedCount > 0
            ? Number(
                ((c.metrics.responses / c.reachedCount) * 100).toFixed(1)
              )
            : 0,
      }))
  }, [campaignsList])

  const handleCreate = () => {
    const newCampaign: Campaign = {
      id: `CAMP${String(campaignsList.length + 1).padStart(3, "0")}`,
      name: formData.name,
      type: formData.type as Campaign["type"],
      channel: formData.channel as Campaign["channel"],
      audience: formData.audience,
      status: "active",
      targetCount: 0,
      reachedCount: 0,
      budget: 0,
      spent: 0,
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      metrics: { opens: 0, clicks: 0, responses: 0, conversions: 0 },
      createdAt: new Date().toISOString().split("T")[0],
    }
    setCampaignsList([...campaignsList, newCampaign])
    toast({
      title: "Campaign Created",
      description: `${formData.name} has been created successfully.`,
      variant: "success",
    })
    setCreateOpen(false)
    setFormData({ name: "", type: "health_camp", channel: "sms", audience: "", message: "" })
  }

  const handlePauseResume = (campaign: Campaign) => {
    const newStatus: Campaign["status"] = campaign.status === "active" ? "draft" : "active"
    setCampaignsList(
      campaignsList.map((c) =>
        c.id === campaign.id ? { ...c, status: newStatus } : c
      )
    )
    const action = newStatus === "active" ? "resumed" : "paused"
    toast({
      title: `Campaign ${action}`,
      description: `${campaign.name} has been ${action}.`,
      variant: "success",
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="CRM & Marketing"
        description="Manage campaigns, loyalty programs, and coupons"
        actions={
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Campaign
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>Create Campaign</DialogTitle>
                <DialogDescription>
                  Launch a new marketing campaign
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="campaign-name">Campaign Name</Label>
                  <Input
                    id="campaign-name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="campaign-type">Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(v) =>
                        setFormData({ ...formData, type: v })
                      }
                    >
                      <SelectTrigger id="campaign-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="health_camp">Health Camp</SelectItem>
                        <SelectItem value="discount_offer">Discount Offer</SelectItem>
                        <SelectItem value="awareness">Awareness</SelectItem>
                        <SelectItem value="corporate_outreach">Corporate Outreach</SelectItem>
                        <SelectItem value="seasonal">Seasonal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="campaign-channel">Channel</Label>
                    <Select
                      value={formData.channel}
                      onValueChange={(v) =>
                        setFormData({ ...formData, channel: v })
                      }
                    >
                      <SelectTrigger id="campaign-channel">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sms">SMS</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                        <SelectItem value="push">Push</SelectItem>
                        <SelectItem value="offline">Offline</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="campaign-audience">Audience</Label>
                  <Select
                    value={formData.audience}
                    onValueChange={(v) =>
                      setFormData({ ...formData, audience: v })
                    }
                  >
                    <SelectTrigger id="campaign-audience">
                      <SelectValue placeholder="Select audience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all_patients">All Patients</SelectItem>
                      <SelectItem value="existing_patients">Existing Patients</SelectItem>
                      <SelectItem value="new_patients">New Patients (last 30 days)</SelectItem>
                      <SelectItem value="corporate_clients">Corporate Clients</SelectItem>
                      <SelectItem value="doctors">Referring Doctors</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="campaign-message">Message Template</Label>
                  <Textarea
                    id="campaign-message"
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    rows={4}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate}>Create Campaign</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Megaphone className="h-5 w-5" />} label="Active Campaigns" value={stats.active} />
        <StatCard icon={<Send className="h-5 w-5" />} label="Total Sent" value={stats.totalSent} />
        <StatCard icon={<TrendingUp className="h-5 w-5" />} label="Response Rate" value={stats.responseRate} />
        <StatCard icon={<Target className="h-5 w-5" />} label="Conversions" value={stats.conversions} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Campaign Comparison</CardTitle>
            <CardDescription>Sent vs responses by campaign</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={campaignCompareData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="sent" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Sent" />
                  <Bar dataKey="responses" fill="#10b981" radius={[4, 4, 0, 0]} name="Responses" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Response Trend</CardTitle>
            <CardDescription>Response rate by campaign</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={responseTrendData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" unit="%" />
                  <RechartsTooltip formatter={(v: unknown) => `${Number(v)}%`} />
                  <Line type="monotone" dataKey="rate" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} name="Response Rate" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="campaigns">
        <TabsList>
          <TabsTrigger value="campaigns">
            <Megaphone className="mr-2 h-4 w-4" />
            Campaigns
          </TabsTrigger>
          <TabsTrigger value="loyalty">
            <Star className="mr-2 h-4 w-4" />
            Loyalty Programs
          </TabsTrigger>
          <TabsTrigger value="coupons">
            <Ticket className="mr-2 h-4 w-4" />
            Coupons
          </TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns">
          <Card>
            <CardContent className="p-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {campaignsList.map((campaign) => {
                  const ChannelIcon = channelIcons[campaign.channel] || Mail
                  const sentPercent =
                    campaign.targetCount > 0
                      ? Math.round((campaign.reachedCount / campaign.targetCount) * 100)
                      : 0
                  const responsePercent =
                    campaign.reachedCount > 0
                      ? Math.round((campaign.metrics.responses / campaign.reachedCount) * 100)
                      : 0
                  return (
                    <Card key={campaign.id} className="border">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <div className="rounded-lg bg-primary/10 p-2 text-primary">
                              <ChannelIcon className="h-4 w-4" />
                            </div>
                            <div>
                              <CardTitle className="text-sm">{campaign.name}</CardTitle>
                              <CardDescription className="text-xs">
                                {typeLabels[campaign.type]} - {channelLabels[campaign.channel]}
                              </CardDescription>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handlePauseResume(campaign)}>
                                {campaign.status === "active" ? (
                                  <>
                                    <PauseCircle className="mr-2 h-4 w-4" />
                                    Pause
                                  </>
                                ) : (
                                  <>
                                    <PlayCircle className="mr-2 h-4 w-4" />
                                    Resume
                                  </>
                                )}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Badge variant={campaignStatusStyles[campaign.status]}>
                          {campaign.status}
                        </Badge>
                        <div className="mt-3 space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Sent</span>
                            <span className="font-medium">
                              {campaign.reachedCount.toLocaleString()} / {campaign.targetCount.toLocaleString()}
                            </span>
                          </div>
                          <Progress value={sentPercent} variant="default" />
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Response Rate</span>
                            <span className="font-medium">{responsePercent}%</span>
                          </div>
                          <Progress value={responsePercent} variant="success" />
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}</span>
                            <span>Budget: {formatCurrency(campaign.budget)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="loyalty">
          <Card>
            <CardContent className="p-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {loyaltyPrograms.map((program) => (
                  <Card key={program.id} className="border">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className="rounded-lg bg-amber-100 p-2 text-amber-700 dark:bg-amber-900 dark:text-amber-200">
                            <Star className="h-4 w-4" />
                          </div>
                          <div>
                            <CardTitle className="text-sm">{program.name}</CardTitle>
                            <CardDescription className="text-xs">
                              {program.enrolledCount.toLocaleString()} active members
                            </CardDescription>
                          </div>
                        </div>
                        <Badge variant={program.isActive ? "success" : "secondary"}>
                          {program.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Points per Rupee</span>
                          <span className="font-medium">{program.pointsPerRupee}x</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Min Redemption</span>
                          <span className="font-medium">{program.minRedemption.toLocaleString()} pts</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Max Redemption</span>
                          <span className="font-medium">{program.maxRedemption.toLocaleString()} pts</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Points Expiry</span>
                          <span className="font-medium">{program.expiryDays} days</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="coupons">
          <Card>
            <CardContent className="p-6">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Discount</TableHead>
                      <TableHead>Min Amount</TableHead>
                      <TableHead className="text-right">Usage</TableHead>
                      <TableHead>Valid Until</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {coupons.map((coupon) => (
                      <TableRow key={coupon.id}>
                        <TableCell>
                          <code className="rounded bg-muted px-2 py-0.5 text-sm font-medium">
                            {coupon.code}
                          </code>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {coupon.description}
                        </TableCell>
                        <TableCell className="font-medium">
                          {coupon.type === "percentage"
                            ? `${coupon.discount}%`
                            : formatCurrency(coupon.discount)}
                        </TableCell>
                        <TableCell>{formatCurrency(coupon.minAmount)}</TableCell>
                        <TableCell className="text-right">
                          {coupon.usedCount.toLocaleString()} / {coupon.usageLimit.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-sm">{formatDate(coupon.expiresAt)}</TableCell>
                        <TableCell>
                          <Badge variant={coupon.isActive ? "success" : "secondary"}>
                            {coupon.isActive ? "Active" : "Expired"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
