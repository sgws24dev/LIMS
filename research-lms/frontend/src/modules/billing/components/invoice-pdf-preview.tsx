import { useState, useEffect, useCallback } from 'react'
import { Download, RefreshCw } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { getInvoicePdf } from '@/services/api/billing'

interface InvoicePdfPreviewProps {
  invoiceId: string
}

export function InvoicePdfPreview({ invoiceId }: InvoicePdfPreviewProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const generatePdf = useCallback(async () => {
    setLoading(true)
    try {
      const blob = await getInvoicePdf(invoiceId)
      if (pdfUrl) URL.revokeObjectURL(pdfUrl)
      setPdfUrl(URL.createObjectURL(blob))
    } catch {
      setPdfUrl(null)
    } finally {
      setLoading(false)
    }
  }, [invoiceId])

  useEffect(() => { generatePdf() }, [generatePdf])

  useEffect(() => {
    return () => { if (pdfUrl) URL.revokeObjectURL(pdfUrl) }
  }, [pdfUrl])

  const handleDownload = async () => {
    const blob = await getInvoicePdf(invoiceId)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `invoice-${invoiceId}.pdf`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={generatePdf} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
        <Button variant="outline" size="sm" onClick={handleDownload} disabled={!pdfUrl}>
          <Download className="h-4 w-4 mr-1" />
          Download PDF
        </Button>
      </div>
      {loading && <div className="text-sm text-muted-foreground">Generating PDF...</div>}
      {pdfUrl && (
        <iframe
          src={pdfUrl}
          className="w-full h-[600px] border rounded-lg"
          title="Invoice PDF Preview"
        />
      )}
    </div>
  )
}
