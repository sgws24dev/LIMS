"use client"

import { useState, useEffect, useRef } from "react"
import {
  Sparkles,
  Brain,
  HeartPulse,
  TrendingUp,
  Package,
  MessageSquare,
  Send,
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Droplets,
  Pill,
  Bot,
  LineChart,
  BarChart3,
  ArrowRight,
  X,
  Loader2,
  Zap,
} from "lucide-react"
import { cn, formatDate, formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { PageHeader } from "@/components/ui/page-header"
import { useToast } from "@/hooks/use-toast"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  LineChart as RechartsLineChart, Line, Area, AreaChart, Legend,
} from "recharts"

const mockResponses: Record<string, string> = {
  "what does high creatinine mean": "High creatinine levels typically indicate impaired kidney function. The kidneys filter creatinine from the blood; elevated levels suggest they may not be working optimally. This could be due to acute kidney injury, chronic kidney disease, dehydration, or certain medications. I recommend consulting a nephrologist for a comprehensive evaluation including eGFR and urine albumin tests.",
  "show me abnormal results today": "Based on today's data, I found 3 abnormal results:\n\n1. **Lipid Profile** (Patient: Rajesh Sharma) - Total Cholesterol: 218 mg/dL (High), LDL: 142 mg/dL (High)\n2. **HbA1c** (Patient: Priya Singh) - 7.2% (Elevated - above target of <7.0%)\n3. **Serum Iron** (Patient: Amit Kumar) - 45 ug/dL (Low - range: 60-170)\n\nWould you like me to generate clinical interpretations for any of these?",
  "interpret lipid profile": "Based on the Lipid Profile results:\n\n**Total Cholesterol: 218 mg/dL** - Borderline High (Desirable: <200)\n**LDL Cholesterol: 142 mg/dL** - High (Optimal: <100)\n**HDL Cholesterol: 38 mg/dL** - Low (Optimal: >40 for men, >50 for women)\n**Triglycerides: 185 mg/dL** - Borderline High (Optimal: <150)\n\n**Clinical Interpretation:** This pattern suggests mixed dyslipidemia with elevated LDL and triglycerides along with low HDL. Cardiovascular risk is moderately increased. Recommend lifestyle modifications including reduced saturated fat intake, regular aerobic exercise, and consider statin therapy if 10-year ASCVD risk is >7.5%.",
  "what is the revenue forecast": "Based on current trends and historical data, the revenue forecast for the next 3 months is:\n\n**July 2026:** ₹12,50,000 (± ₹1,20,000)\n**August 2026:** ₹13,80,000 (± ₹1,50,000)\n**September 2026:** ₹15,20,000 (± ₹1,80,000)\n\nThe projected growth is driven by increasing patient volume (+12% MoM) and new corporate account acquisitions. The confidence interval widens in later months due to seasonal variability.",
  "which reagents need reordering": "Based on current inventory levels and projected consumption, the following reagents need reordering:\n\n| Reagent | Current Stock | Min Required | Reorder By |\n|---------|:------------:|:------------:|:----------:|\n| CBC Reagent | 45 tests | 100 | 3 days |\n| Lipid Profile Kit | 28 tests | 75 | 5 days |\n| HbA1c Cartridge | 12 tests | 30 | 2 days |\n| Liver Function Kit | 60 tests | 80 | 7 days |\n\n⚠️ **Critical:** HbA1c Cartridge will run out in 2 days. Please place an urgent order.",
  "default": "I'm your AI Lab Assistant. I can help you with:\n\n- **🔬 Test Interpretation:** Ask \"Interpret lipid profile\" or \"What does high creatinine mean?\"\n- **📊 Results Analysis:** Ask \"Show me abnormal results today\"\n- **📈 Forecasting:** Ask \"Revenue forecast\" or \"Test volume predictions\"\n- **📦 Inventory:** Ask \"Which reagents need reordering?\"\n\nHow can I assist you today?"
}

const aiSummaryData = {
  patientName: "Rajesh Sharma",
  testName: "Lipid Profile & HbA1c",
  date: "2026-06-08T10:30:00Z",
  keyFindings: [
    { parameter: "Total Cholesterol", value: "218 mg/dL", status: "high", interpretation: "Above optimal level of <200 mg/dL. Indicates increased cardiovascular risk." },
    { parameter: "LDL Cholesterol", value: "142 mg/dL", status: "high", interpretation: "Significantly above optimal <100 mg/dL. Primary target for lipid-lowering therapy." },
    { parameter: "HDL Cholesterol", value: "38 mg/dL", status: "low", interpretation: "Below protective level of >40 mg/dL. Low HDL is an independent risk factor." },
    { parameter: "HbA1c", value: "6.8%", status: "elevated", interpretation: "Indicates prediabetes (range 5.7-6.4%). Risk of progressing to type 2 diabetes." },
  ],
  overallAssessment: "Patient shows features of metabolic syndrome with dyslipidemia and prediabetes. Recommend lifestyle modifications, repeat HbA1c in 3 months, and consider lipid-lowering therapy if ASCVD risk is elevated.",
  recommendations: [
    "Dietary modification: Reduce saturated fats, increase fiber intake",
    "Exercise: Minimum 150 min/week moderate aerobic activity",
    "Monitor fasting blood sugar weekly",
    "Repeat HbA1c in 3 months",
    "Consider statin therapy evaluation",
  ],
}

const healthInsightsData = [
  { icon: <Droplets className="h-4 w-4" />, title: "Blood Sugar", level: "stable", message: "Your fasting glucose has been stable for 3 months. Continue current management.", color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30" },
  { icon: <Activity className="h-4 w-4" />, title: "Cholesterol", level: "needs-attention", message: "LDL elevated. Consider dietary changes and follow-up lipid profile in 6 weeks.", color: "text-amber-600 bg-amber-100 dark:bg-amber-900/30" },
  { icon: <HeartPulse className="h-4 w-4" />, title: "Cardiac Risk", level: "moderate", message: "10-year ASCVD risk estimated at 8.5%. Moderate risk - lifestyle optimization recommended.", color: "text-orange-600 bg-orange-100 dark:bg-orange-900/30" },
  { icon: <Pill className="h-4 w-4" />, title: "Vitamin D", level: "low", message: "Levels remain low despite supplementation. Consider increasing dosage to 2000 IU/day.", color: "text-red-600 bg-red-100 dark:bg-red-900/30" },
  { icon: <Droplets className="h-4 w-4" />, title: "Kidney Function", level: "normal", message: "Creatinine and eGFR are within normal range. Maintain hydration.", color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30" },
]

const revenueForecastData = [
  { month: "Apr", actual: 1100000, forecast: null, lowerBound: null, upperBound: null },
  { month: "May", actual: 1250000, forecast: null, lowerBound: null, upperBound: null },
  { month: "Jun", actual: 1180000, forecast: null, lowerBound: null, upperBound: null },
  { month: "Jul", actual: null, forecast: 1250000, lowerBound: 1130000, upperBound: 1370000 },
  { month: "Aug", actual: null, forecast: 1380000, lowerBound: 1230000, upperBound: 1530000 },
  { month: "Sep", actual: null, forecast: 1520000, lowerBound: 1340000, upperBound: 1700000 },
]

const inventoryForecastData = [
  { reagent: "CBC Reagent", currentStock: 45, predictedConsumption: 85, minRequired: 100, status: "critical" },
  { reagent: "Lipid Profile Kit", currentStock: 28, predictedConsumption: 65, minRequired: 75, status: "low" },
  { reagent: "HbA1c Cartridge", currentStock: 12, predictedConsumption: 35, minRequired: 30, status: "critical" },
  { reagent: "LFT Kit", currentStock: 60, predictedConsumption: 70, minRequired: 80, status: "low" },
  { reagent: "Urine Strip (100)", currentStock: 120, predictedConsumption: 80, minRequired: 50, status: "ok" },
  { reagent: "Blood Culture Bottle", currentStock: 200, predictedConsumption: 90, minRequired: 100, status: "ok" },
]

const quickChatQuestions = [
  "What does high creatinine mean?",
  "Show me abnormal results today",
  "Interpret lipid profile",
  "What is the revenue forecast?",
  "Which reagents need reordering?",
]

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

function AIChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init",
      role: "assistant",
      content: mockResponses["default"],
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async (text?: string) => {
    const messageText = (text || input).trim()
    if (!messageText || isGenerating) return

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: messageText,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsGenerating(true)

    await new Promise((resolve) => setTimeout(resolve, 1500 + Math.random() * 1500))

    const lowerQuery = messageText.toLowerCase()
    let responseText = mockResponses["default"]
    for (const [key, value] of Object.entries(mockResponses)) {
      if (lowerQuery.includes(key)) {
        responseText = value
        break
      }
    }

    const assistantMessage: ChatMessage = {
      id: `ai-${Date.now()}`,
      role: "assistant",
      content: responseText,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, assistantMessage])
    setIsGenerating(false)
  }

  return (
    <Card className="flex flex-col h-[500px]">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-primary/10 p-2 text-primary">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-base">AI Lab Assistant</CardTitle>
            <CardDescription>Ask me anything about lab results</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea ref={scrollRef} className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex gap-3",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {msg.role === "assistant" && (
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Brain className="h-4 w-4" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[80%] rounded-xl px-4 py-2.5 text-sm",
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  <div className="whitespace-pre-line">{msg.content}</div>
                  <p className={cn("mt-1 text-[10px]", msg.role === "user" ? "text-primary-foreground/60" : "text-muted-foreground")}>
                    {formatDate(msg.timestamp, "time")}
                  </p>
                </div>
                {msg.role === "user" && (
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <span className="text-xs font-bold">U</span>
                  </div>
                )}
              </div>
            ))}
            {isGenerating && (
              <div className="flex gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Brain className="h-4 w-4" />
                </div>
                <div className="rounded-xl bg-muted px-4 py-3">
                  <div className="flex gap-1">
                    <div className="h-2 w-2 animate-bounce rounded-full bg-foreground/40" style={{ animationDelay: "0ms" }} />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-foreground/40" style={{ animationDelay: "200ms" }} />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-foreground/40" style={{ animationDelay: "400ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="border-t p-3 space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {quickChatQuestions.map((q) => (
              <button
                key={q}
                className="rounded-full bg-muted px-2.5 py-1 text-[10px] text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                onClick={() => handleSend(q)}
                disabled={isGenerating}
              >
                {q}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Ask about results, interpretation, or forecasts..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              disabled={isGenerating}
              className="flex-1"
            />
            <Button size="icon" onClick={() => handleSend()} disabled={!input.trim() || isGenerating}>
              {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ShimmerLoading() {
  return (
    <div className="space-y-3 p-4">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-20 w-full" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  )
}

export default function AiFeatures() {
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false)
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false)
  const { toast } = useToast()

  const handleRegenerateSummary = () => {
    setIsGeneratingSummary(true)
    toast({ title: "AI Generating", description: "Analyzing latest report data...", variant: "default" })
    setTimeout(() => setIsGeneratingSummary(false), 2000)
  }

  const handleRefreshInsights = () => {
    setIsGeneratingInsights(true)
    toast({ title: "AI Refreshing", description: "Updating health insights...", variant: "default" })
    setTimeout(() => setIsGeneratingInsights(false), 2000)
  }

  const healthInsightColors: Record<string, string> = {
    stable: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    "needs-attention": "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    moderate: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
    low: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
    normal: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Features"
        description="Intelligent insights and automation powered by artificial intelligence"
        actions={
          <Badge variant="secondary" className="gap-1 rounded-full px-3 py-1">
            <Zap className="h-3 w-3" />
            AI Powered
          </Badge>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* AI Report Summary */}
        <Card className="lg:col-span-2 border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-start justify-between pb-3">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-primary/10 p-2.5 text-primary">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base">AI Report Summary</CardTitle>
                  <Badge variant="secondary" className="text-[10px]">Latest</Badge>
                </div>
                <CardDescription>
                  AI-generated clinical summary for {aiSummaryData.patientName} &middot; {aiSummaryData.testName} &middot; {formatDate(aiSummaryData.date, "short")}
                </CardDescription>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleRegenerateSummary} disabled={isGeneratingSummary}>
              {isGeneratingSummary ? (
                <><Loader2 className="mr-2 h-3 w-3 animate-spin" /> Generating</>
              ) : (
                <><Sparkles className="mr-2 h-3 w-3" /> Regenerate</>
              )}
            </Button>
          </CardHeader>
          <CardContent>
            {isGeneratingSummary ? (
              <ShimmerLoading />
            ) : (
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  {aiSummaryData.keyFindings.map((finding) => (
                    <div key={finding.parameter} className="rounded-lg border p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{finding.parameter}</span>
                        <span className={cn(
                          "text-sm font-mono font-semibold",
                          finding.status === "high" || finding.status === "elevated" ? "text-amber-600 dark:text-amber-400" :
                          finding.status === "low" ? "text-red-600 dark:text-red-400" :
                          "text-muted-foreground"
                        )}>
                          {finding.value}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{finding.interpretation}</p>
                    </div>
                  ))}
                </div>

                <div className="rounded-lg bg-muted p-3">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                    <div>
                      <p className="text-sm font-medium">Overall Assessment</p>
                      <p className="text-sm text-muted-foreground">{aiSummaryData.overallAssessment}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-sm font-medium">Recommendations</p>
                  <div className="space-y-1.5">
                    {aiSummaryData.recommendations.map((rec, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Health Insights */}
        <Card>
          <CardHeader className="flex flex-row items-start justify-between pb-3">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-emerald-100 p-2.5 text-emerald-600 dark:bg-emerald-900/30">
                <HeartPulse className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base">AI Health Insights</CardTitle>
                <CardDescription>Personalized health recommendations</CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleRefreshInsights} disabled={isGeneratingInsights}>
              {isGeneratingInsights ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            </Button>
          </CardHeader>
          <CardContent>
            {isGeneratingInsights ? (
              <ShimmerLoading />
            ) : (
              <div className="space-y-3">
                {healthInsightsData.map((insight) => (
                  <div key={insight.title} className="rounded-lg border p-3">
                    <div className="flex items-center gap-2">
                      <div className={cn("rounded-full p-1.5", insight.color)}>
                        {insight.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{insight.title}</span>
                          <span className={cn(
                            "rounded-full px-2 py-0.5 text-[10px] font-medium",
                            healthInsightColors[insight.level] || "bg-muted text-muted-foreground"
                          )}>
                            {insight.level === "needs-attention" ? "Needs Attention" : insight.level.charAt(0).toUpperCase() + insight.level.slice(1)}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">{insight.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Revenue Forecast */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-blue-100 p-2.5 text-blue-600 dark:bg-blue-900/30">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base">AI Revenue Forecast</CardTitle>
                <CardDescription>Projected revenue with 95% confidence interval</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueForecastData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs text-muted-foreground" />
                  <YAxis className="text-xs text-muted-foreground" tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} />
                  <RechartsTooltip
                    formatter={(value: unknown) => [value ? formatCurrency(Number(value)) : "N/A", "Revenue"]}
                    contentStyle={{ borderRadius: "8px", border: "1px solid var(--border)" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="upperBound"
                    stroke="transparent"
                    fill="var(--primary)"
                    fillOpacity={0.1}
                  />
                  <Area
                    type="monotone"
                    dataKey="lowerBound"
                    stroke="transparent"
                    fill="var(--primary)"
                    fillOpacity={0.1}
                  />
                  <Line
                    type="monotone"
                    dataKey="actual"
                    stroke="var(--primary)"
                    strokeWidth={2}
                    dot={{ fill: "var(--primary)", r: 4 }}
                    name="Actual"
                  />
                  <Line
                    type="monotone"
                    dataKey="forecast"
                    stroke="var(--primary)"
                    strokeWidth={2}
                    strokeDasharray="6 3"
                    dot={{ fill: "var(--primary)", r: 4 }}
                    name="Forecast"
                  />
                  <Legend />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="h-2 w-4 rounded bg-primary" /> Actual
              </span>
              <span className="flex items-center gap-1">
                <span className="h-0.5 w-4 border-b-2 border-dashed border-primary" /> Forecast
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-4 rounded bg-primary/20" /> Confidence Interval
              </span>
            </div>
          </CardContent>
        </Card>

        {/* AI Inventory Forecast */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-purple-100 p-2.5 text-purple-600 dark:bg-purple-900/30">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base">AI Inventory Forecast</CardTitle>
                <CardDescription>Predicted reagent consumption with reorder alerts</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={inventoryForecastData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" className="text-xs text-muted-foreground" />
                  <YAxis type="category" dataKey="reagent" className="text-xs text-muted-foreground" width={140} />
                  <RechartsTooltip
                    contentStyle={{ borderRadius: "8px", border: "1px solid var(--border)" }}
                  />
                  <Bar dataKey="currentStock" fill="var(--primary)" radius={[0, 4, 4, 0]} name="Current Stock" />
                  <Bar dataKey="predictedConsumption" fill="var(--primary)" fillOpacity={0.3} radius={[0, 4, 4, 0]} name="Predicted Consumption" />
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {inventoryForecastData.filter((i) => i.status !== "ok").map((item) => (
                <div key={item.reagent} className={cn(
                  "rounded-lg border p-3",
                  item.status === "critical" && "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/20",
                  item.status === "low" && "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/20",
                )}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{item.reagent}</span>
                    <Badge variant={item.status === "critical" ? "destructive" : "warning"} className="text-[10px]">
                      {item.status === "critical" ? "Reorder Now" : "Order Soon"}
                    </Badge>
                  </div>
                  <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Current Stock:</span>
                      <span className="font-medium">{item.currentStock} tests</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Predicted Need:</span>
                      <span className="font-medium">{item.predictedConsumption} tests</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Min Required:</span>
                      <span className="font-medium">{item.minRequired} tests</span>
                    </div>
                  </div>
                  <Progress
                    value={(item.currentStock / item.predictedConsumption) * 100}
                    variant={item.status === "critical" ? "danger" : "warning"}
                    className="mt-2"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Chat Panel */}
        <div className="lg:col-span-2">
          <AIChatPanel />
        </div>
      </div>
    </div>
  )
}
