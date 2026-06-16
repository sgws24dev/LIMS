import { useEffect, useState } from "react"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/shared/ui/dialog"
import { Button } from "@/shared/ui/button"
import { getAssetQrCode } from "@/services/api/facilities"
import { Loader2, Download, Printer, QrCode, FileText } from "lucide-react"

interface QrLabelDialogProps {
  assetId: string
  assetName: string
  identifier: string
  open: boolean
  onClose: () => void
}

export default function QrLabelDialog({
  assetId, assetName, identifier, open, onClose,
}: QrLabelDialogProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [labelMode, setLabelMode] = useState(true)

  useEffect(() => {
    if (!open) return
    setLoading(true)
    setImageUrl(null)
    getAssetQrCode(assetId, labelMode)
      .then((blob) => {
        const url = URL.createObjectURL(blob)
        setImageUrl(url)
      })
      .finally(() => setLoading(false))
    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl)
    }
  }, [open, assetId, labelMode])

  const handleDownload = () => {
    if (!imageUrl) return
    const a = document.createElement("a")
    a.href = imageUrl
    a.download = `asset-${identifier}-label.png`
    a.click()
  }

  const handlePrint = () => {
    if (!imageUrl) return
    const win = window.open("", "_blank")
    if (!win) return
    win.document.write(`
      <html>
        <head>
          <style>
            @media print {
              body { margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; }
              img { max-width: 100%; height: auto; }
            }
          </style>
        </head>
        <body>
          <img src="${imageUrl}" onload="window.print(); window.close();" />
        </body>
      </html>
    `)
    win.document.close()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>QR Label — {assetName}</DialogTitle>
          <DialogDescription>Preview and print QR label for {identifier}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-center items-center min-h-[200px] rounded-lg border border-border/50 bg-muted/10">
            {loading ? (
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            ) : imageUrl ? (
              <img src={imageUrl} alt="QR Label" className="max-w-full max-h-[300px] object-contain p-2" style={{ imageRendering: "pixelated" }} />
            ) : (
              <p className="text-sm text-muted-foreground">Failed to load label</p>
            )}
          </div>

          <div className="flex items-center justify-center gap-2">
            <Button
              variant={labelMode ? "default" : "outline"}
              size="sm"
              onClick={() => setLabelMode(true)}
            >
              <FileText className="mr-1 h-4 w-4" /> Full Label
            </Button>
            <Button
              variant={!labelMode ? "default" : "outline"}
              size="sm"
              onClick={() => setLabelMode(false)}
            >
              <QrCode className="mr-1 h-4 w-4" /> QR Only
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">Label prints at 4×2 inches (101mm × 51mm)</p>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={handleDownload}>
              <Download className="mr-1 h-4 w-4" /> Download PNG
            </Button>
            <Button className="flex-1" onClick={handlePrint}>
              <Printer className="mr-1 h-4 w-4" /> Print
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
