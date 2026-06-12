"use client"

import { useState, useEffect, useMemo } from "react"
import { useNavigate, useSearchParams } from "react-router"
import {
  Brain,
  ChevronLeft,
  Lightbulb,
  TrendingUp,
  Activity,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
  FileText,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { useAppStore } from "@/store/appStore"
import { useToast } from "@/hooks/use-toast"
import { cn, formatDate } from "@/lib/utils"
import type { Result, ResultParameter } from "@/types"
import { results as mockResults } from "@/mock/data/results"

interface AIInterpretation {
  paramName: string
  value: string
  unit: string
  referenceRange: string
  isAbnormal: boolean
  interpretation: string
  confidence: number
  keyFinding: boolean
}

const mockFindings: Record<string, string> = {
  "Glucose (Fasting)": "Elevated fasting glucose indicates impaired glucose metabolism. Consistent with prediabetic state. HbA1c correlation recommended.",
  "HbA1c": "HbA1c level above 5.7% indicates prediabetes. Values above 6.5% are diagnostic of diabetes. Lifestyle modification and monitoring advised.",
  "Total Cholesterol": "Total cholesterol is above the desirable threshold of 200 mg/dL. This increases cardiovascular risk, especially when combined with low HDL.",
  "Triglycerides": "Elevated triglycerides are often associated with dietary factors, metabolic syndrome, and increased cardiovascular risk.",
  "HDL Cholesterol": "HDL cholesterol below 40 mg/dL is a significant cardiovascular risk factor. Low HDL is often associated with sedentary lifestyle and metabolic syndrome.",
  "LDL Cholesterol": "LDL cholesterol above 130 mg/dL is considered borderline high. Elevated LDL is a major risk factor for atherosclerosis and coronary artery disease.",
  "VLDL Cholesterol": "VLDL is slightly elevated, which correlates with increased triglyceride levels and may indicate dyslipidemia.",
  "Hemoglobin": "Hemoglobin below the reference range indicates anemia. Further iron studies (ferritin, TIBC, serum iron) are recommended to determine the cause.",
  "eGFR": "eGFR below 90 mL/min/1.73m² indicates reduced kidney function. Values below 60 suggest chronic kidney disease. Serial monitoring is recommended.",
  "Serum Creatinine": "Elevated creatinine reflects impaired renal function. Correlation with eGFR and BUN is essential for accurate assessment.",
  "Blood Urea": "Elevated blood urea supports findings of reduced glomerular filtration. Consider hydration status and protein intake.",
  "TSH": "TSH below 0.4 µIU/mL indicates hyperthyroidism. Correlation with Free T3 and T4 is essential for diagnosis and management.",
  "Rheumatoid Factor": "RA Factor above 15 IU/mL is abnormal. Elevated levels are associated with rheumatoid arthritis and other autoimmune conditions.",
  "AST (SGOT)": "Mildly elevated AST may indicate hepatocellular injury. Common causes include alcohol, medications, and viral hepatitis.",
  "ALT (SGPT)": "ALT within normal range suggests no significant hepatocellular damage. ALT is more specific to liver injury than AST.",
  "CA 125": "CA 125 levels above 35 U/mL require clinical correlation. While associated with ovarian cancer, it can be elevated in benign conditions as well.",
  "HBsAg": "Reactive HBsAg indicates active Hepatitis B infection. Confirmatory testing with HBeAg, HBV DNA, and liver function tests recommended.",
  "Uric Acid (24h)": "24-hour urinary uric acid above 750 mg indicates hyperuricosuria. May predispose to uric acid stone formation.",
  "PSA Total": "PSA above 4.0 ng/mL requires further evaluation. Digital rectal examination and repeat PSA testing are recommended.",
}

function generateInterpretation(param: ResultParameter): AIInterpretation {
  const finding = mockFindings[param.parameterName]
  const baseConfidence = param.isCritical ? 0.95 : param.isAbnormal ? 0.85 : 0.75
  const confidence = Math.round((baseConfidence + Math.random() * 0.1) * 100) / 100

  return {
    paramName: param.parameterName,
    value: param.value,
    unit: param.unit,
    referenceRange: param.referenceRange,
    isAbnormal: param.isAbnormal,
    interpretation: finding || `${param.parameterName} at ${param.value} ${param.unit}. Reference range: ${param.referenceRange}. No specific AI interpretation available for this parameter.`,
    confidence,
    keyFinding: param.isCritical || (param.isAbnormal && Math.random() > 0.6),
  }
}

export default function AiInterpretationPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { toast } = useToast()
  const setBreadcrumbs = useAppStore((s) => s.setBreadcrumbs)

  const resultId = searchParams.get("id") || "RES001"
  const [loading, setLoading] = useState(true)
  const [result, setResult] = useState<Result | null>(null)
  const [reviewed, setReviewed] = useState(false)

  useEffect(() => {
    setBreadcrumbs([
      { label: "Home", href: "/dashboard" },
      { label: "Reports" },
      { label: "AI Interpretation" },
    ])
    const timer = setTimeout(() => {
      const found = mockResults.find((r) => r.id === resultId)
      setResult(found || null)
      setLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [setBreadcrumbs, resultId])

  const interpretations = useMemo(() => {
    if (!result) return []
    return result.parameters.map(generateInterpretation)
  }, [result])

  const keyFindings = useMemo(() => interpretations.filter((i) => i.keyFinding), [interpretations])

  const avgConfidence = useMemo(() => {
    if (interpretations.length === 0) return 0
    return Math.round((interpretations.reduce((s, i) => s + i.confidence, 0) / interpretations.length) * 100)
  }, [interpretations])

  const recommendations = useMemo(() => {
    const recs: string[] = []
    if (keyFindings.some((k) => k.paramName.toLowerCase().includes("glucose") || k.paramName.toLowerCase().includes("hba1c"))) {
      recs.push("Fasting blood glucose monitoring and oral glucose tolerance test recommended.")
    }
    if (keyFindings.some((k) => k.paramName.toLowerCase().includes("cholesterol") || k.paramName.toLowerCase().includes("triglycerides"))) {
      recs.push("Lipid-lowering diet and lifestyle modification. Consider statin therapy if risk factors present.")
    }
    if (keyFindings.some((k) => k.paramName.toLowerCase().includes("egfr") || k.paramName.toLowerCase().includes("creatinine"))) {
      recs.push("Nephrology referral for further evaluation of renal function. Avoid nephrotoxic medications.")
    }
    if (keyFindings.some((k) => k.paramName.toLowerCase().includes("tsh"))) {
      recs.push("Endocrinology consultation for thyroid function optimization.")
    }
    if (keyFindings.some((k) => k.paramName.toLowerCase().includes("hemoglobin") && k.isAbnormal)) {
      recs.push("Iron studies (ferritin, TIBC, serum iron) and peripheral smear recommended to evaluate anemia.")
    }
    if (recs.length === 0) {
      recs.push("All key parameters within expected ranges. Continue routine health monitoring.")
      recs.push("Maintain healthy diet and regular exercise. Annual health check-up recommended.")
    }
    return recs
  }, [keyFindings])

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="AI Interpretation" description="AI-powered analysis of test results" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">{Array.from({ length: 3 }).map((_, i) => (<Skeleton key={i} className="h-32 w-full rounded-xl" />))}</div>
          <div className="space-y-4">{Array.from({ length: 2 }).map((_, i) => (<Skeleton key={i} className="h-40 w-full rounded-xl" />))}</div>
        </div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="space-y-6">
        <PageHeader title="AI Interpretation" description="AI-powered analysis of test results" actions={<Button variant="outline" onClick={() => navigate(-1)}><ChevronLeft className="mr-2 h-4 w-4" />Back</Button>} />
        <EmptyState icon={<Brain className="h-12 w-12" />} title="Report not found" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Interpretation"
        description={`AI-powered analysis for ${result.patientName} - ${result.testName}`}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {interpretations.map((interp, idx) => (
            <Card key={idx} className={cn(interp.keyFinding && "border-primary/30 bg-primary/[0.02]")}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      {interp.keyFinding ? (
                        <Lightbulb className="h-4 w-4 text-amber-500" />
                      ) : (
                        <Brain className="h-4 w-4 text-primary/60" />
                      )}
                      <span className="font-medium">{interp.paramName}</span>
                      <Badge variant={interp.isAbnormal ? "warning" : "success"} className="text-[10px] px-1.5 py-0">
                        {interp.isAbnormal ? "Abnormal" : "Normal"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span>Value: <span className={cn("font-mono font-medium", interp.isAbnormal && "text-destructive")}>{interp.value} {interp.unit}</span></span>
                      <Separator orientation="vertical" className="h-3" />
                      <span>Range: {interp.referenceRange}</span>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="text-sm">{interp.interpretation}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                      <span>Confidence</span>
                      <span>{Math.round(interp.confidence * 100)}%</span>
                    </div>
                    <Progress value={interp.confidence * 100} className="h-1.5" />
                  </div>
                  {interp.keyFinding && (
                    <Badge variant="info" className="flex items-center gap-1 text-[10px] px-1.5 py-0">
                      <Sparkles className="h-3 w-3" />Key Finding
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          <Card className="border-primary/20">
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><BarChart3 className="h-4 w-4" />Key Findings</CardTitle></CardHeader>
            <CardContent>
              {keyFindings.length === 0 ? (
                <p className="text-sm text-muted-foreground">No significant findings detected.</p>
              ) : (
                <div className="space-y-2">
                  {keyFindings.map((kf, idx) => (
                    <div key={idx} className="flex items-start gap-2 rounded-lg border p-3">
                      <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">{kf.paramName}</p>
                        <p className="text-xs text-muted-foreground">{kf.value} {kf.unit}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-950/10">
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Target className="h-4 w-4 text-emerald-600" />Recommendations</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Activity className="h-4 w-4" />Analysis Summary</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total Parameters</span>
                <span className="font-medium">{interpretations.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Abnormal Findings</span>
                <span className="font-medium text-amber-600">{interpretations.filter((i) => i.isAbnormal).length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Key Findings</span>
                <span className="font-medium text-destructive">{keyFindings.length}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Avg. Confidence</span>
                <span className="font-medium">{avgConfidence}%</span>
              </div>
              <Progress value={avgConfidence} className="h-1.5" />
              <div className="flex items-center gap-2 pt-2">
                <Checkbox id="ai-reviewed" checked={reviewed} onCheckedChange={(c) => setReviewed(!!c)} />
                <Label htmlFor="ai-reviewed" className="text-sm">Reviewed by pathologist</Label>
              </div>
              {reviewed && (
                <Button size="sm" className="w-full" onClick={() => toast({ title: "AI interpretation reviewed", variant: "success" })}>
                  <ShieldCheck className="mr-2 h-4 w-4" />Confirm Review
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
