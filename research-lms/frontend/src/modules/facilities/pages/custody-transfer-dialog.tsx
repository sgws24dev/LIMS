import { useState, useRef, useEffect } from "react"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/shared/ui/dialog"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Textarea } from "@/shared/ui/textarea"
import { Label } from "@/shared/ui/label"
import { Checkbox } from "@/shared/ui/checkbox"
import { transferCustody, getCurrentCustodian, type CustodyEvent } from "@/services/api/facilities"
import { useToast } from "@/hooks/use-toast"
import { Loader2, User, MapPin, ArrowRight, Check } from "lucide-react"

interface CustodyTransferDialogProps {
  assetId: string
  assetName: string
  currentLocation: string
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}

export default function CustodyTransferDialog({
  assetId, assetName, currentLocation, open, onClose, onSuccess,
}: CustodyTransferDialogProps) {
  const { toast } = useToast()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [step, setStep] = useState(1)
  const [currentCustodian, setCurrentCustodian] = useState<CustodyEvent | null>(null)
  const [toUserId] = useState("")
  const [toUserName, setToUserName] = useState("")
  const [toLocation, setToLocation] = useState("")
  const [reason, setReason] = useState("")
  const [notes, setNotes] = useState("")
  const [confirmed, setConfirmed] = useState(false)
  const [signatureData, setSignatureData] = useState<string | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      setStep(1)
      setToUserName("")
      setToLocation("")
      setReason("")
      setNotes("")
      setConfirmed(false)
      setSignatureData(null)
      getCurrentCustodian(assetId).then(setCurrentCustodian).catch(() => {})
    }
  }, [open, assetId])

  useEffect(() => {
    if (step !== 3 || !canvasRef.current) return
    const canvas = canvasRef.current
    canvas.width = 400
    canvas.height = 150
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.strokeStyle = "#000"
    ctx.lineWidth = 2
    ctx.lineCap = "round"
  }, [step])

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true)
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.beginPath()
    const rect = canvas.getBoundingClientRect()
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY
    ctx.moveTo(clientX - rect.left, clientY - rect.top)
  }

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const rect = canvas.getBoundingClientRect()
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY
    ctx.lineTo(clientX - rect.left, clientY - rect.top)
    ctx.stroke()
  }

  const endDraw = () => {
    setIsDrawing(false)
    const canvas = canvasRef.current
    if (!canvas) return
    setSignatureData(canvas.toDataURL("image/png"))
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setSignatureData(null)
  }

  const isCanvasBlank = () => {
    const canvas = canvasRef.current
    if (!canvas) return true
    const ctx = canvas.getContext("2d")
    if (!ctx) return true
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] !== 0) return false
    }
    return true
  }

  const handleSubmit = async () => {
    if (!confirmed || isCanvasBlank()) return
    setSubmitting(true)
    try {
      await transferCustody({
        assetId,
        toUserId: toUserId || "00000000-0000-0000-0000-000000000000",
        toUserName,
        toLocation,
        reason: reason || undefined,
        signatureData: signatureData || undefined,
        notes: notes || undefined,
      })
      toast({ title: "Success", description: "Asset transfer recorded successfully" })
      onSuccess?.()
      onClose()
    } catch {
      toast({ title: "Error", description: "Failed to transfer custody", variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Transfer Custody — {assetName}</DialogTitle>
          <DialogDescription>
            Step {step} of 3: {step === 1 ? "Select Recipient" : step === 2 ? "Review & Confirm" : "Digital Signature"}
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4">
            {currentCustodian && (
              <div className="rounded-lg bg-muted/30 p-3 space-y-1">
                <p className="text-xs text-muted-foreground">Current custodian</p>
                <p className="text-sm font-medium">{currentCustodian.toUserName}</p>
                <p className="text-xs text-muted-foreground">{currentCustodian.toLocation}</p>
              </div>
            )}
            <div className="space-y-2">
              <Label>Recipient Name</Label>
              <Input value={toUserName} onChange={(e) => setToUserName(e.target.value)} placeholder="Full name" />
            </div>
            <div className="space-y-2">
              <Label>Destination Location</Label>
              <Input value={toLocation} onChange={(e) => setToLocation(e.target.value)} placeholder="Room, building, etc." />
            </div>
            <div className="space-y-2">
              <Label>Reason (optional)</Label>
              <Textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} />
            </div>
            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
            </div>
            <Button className="w-full" onClick={() => setStep(2)} disabled={!toUserName || !toLocation}>
              Continue <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="rounded-lg bg-muted/30 p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">From:</span>
                <span className="font-medium">{currentCustodian?.toUserName || "Initial assignment"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Location:</span>
                <span className="font-medium">{currentCustodian?.toLocation || currentLocation}</span>
              </div>
              <div className="border-t border-border/50 pt-2 mt-2">
                <div className="flex items-center gap-2 text-sm">
                  <ArrowRight className="h-4 w-4 text-primary" />
                  <span className="font-medium text-primary">To: {toUserName}</span>
                </div>
                <div className="flex items-center gap-2 text-sm mt-1">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="font-medium text-primary">{toLocation}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="confirm" checked={confirmed} onCheckedChange={(c) => setConfirmed(c as boolean)} />
              <Label htmlFor="confirm" className="text-sm">I confirm this asset transfer is authorized</Label>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">Back</Button>
              <Button className="flex-1" onClick={() => setStep(3)} disabled={!confirmed}>Continue to Signature</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="rounded-lg border border-border/50 p-2">
              <canvas
                ref={canvasRef}
                className="w-full h-[150px] rounded cursor-crosshair touch-none"
                style={{ background: "#fafafa" }}
                onMouseDown={startDraw}
                onMouseMove={draw}
                onMouseUp={endDraw}
                onMouseLeave={endDraw}
                onTouchStart={startDraw}
                onTouchMove={draw}
                onTouchEnd={endDraw}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={clearSignature}>Clear</Button>
              <span className="text-xs text-muted-foreground self-center ml-2">Sign above using mouse or touch</span>
            </div>
            <div className="flex gap-2 pt-2 border-t">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1">Back</Button>
              <Button
                className="flex-1"
                onClick={handleSubmit}
                disabled={!confirmed || isCanvasBlank() || submitting}
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Check className="h-4 w-4 mr-1" />}
                {submitting ? "Submitting..." : "Submit Transfer"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
