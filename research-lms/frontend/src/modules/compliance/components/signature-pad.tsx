import { useRef, useState, useCallback } from 'react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'

interface SignaturePadProps {
  onSave: (signatureData: string, signerName: string, signerEmail: string) => void
  disabled?: boolean
  storedSignatureData?: string
  storedSignerName?: string
  readOnly?: boolean
}

export default function SignaturePad({ onSave, disabled, storedSignatureData, storedSignerName, readOnly }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasContent, setHasContent] = useState(false)
  const [signerName, setSignerName] = useState(storedSignerName ?? '')
  const [signerEmail, setSignerEmail] = useState('')

  const getPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement> | PointerEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    if ('touches' in e && e.touches.length > 0) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top }
    }
    const me = e as MouseEvent
    return { x: me.clientX - rect.left, y: me.clientY - rect.top }
  }

  const startDrawing = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (disabled || readOnly) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    setIsDrawing(true)
    const { x, y } = getPos(e)
    ctx.beginPath()
    ctx.moveTo(x, y)
  }, [disabled, readOnly])

  const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || disabled || readOnly) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const { x, y } = getPos(e)
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.strokeStyle = '#000'
    ctx.lineTo(x, y)
    ctx.stroke()
    setHasContent(true)
  }, [isDrawing, disabled, readOnly])

  const stopDrawing = useCallback(() => {
    setIsDrawing(false)
  }, [])

  const clear = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasContent(false)
  }, [])

  const handleSave = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    if (!signerName.trim() || !signerEmail.trim()) return
    onSave(canvas.toDataURL('image/png'), signerName.trim(), signerEmail.trim())
  }, [onSave, signerName, signerEmail])

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Input
          placeholder="Signer name"
          value={signerName}
          onChange={(e) => setSignerName(e.target.value)}
          disabled={disabled || readOnly}
        />
        <Input
          placeholder="Signer email"
          type="email"
          value={signerEmail}
          onChange={(e) => setSignerEmail(e.target.value)}
          disabled={disabled || readOnly}
        />
      </div>

      {storedSignatureData ? (
        <div className="border rounded-md p-2 bg-white">
          <img src={storedSignatureData} alt="Stored signature" className="w-full h-[150px] object-contain" />
          {storedSignerName && <p className="text-xs text-muted-foreground mt-1">Signed by: {storedSignerName}</p>}
        </div>
      ) : (
        <div className="border rounded-md p-1 bg-white">
          <canvas
            ref={canvasRef}
            width={400}
            height={150}
            className="w-full cursor-crosshair touch-none"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
        </div>
      )}

      {!readOnly && !storedSignatureData && (
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={clear} disabled={disabled || !hasContent}>
            Clear
          </Button>
          <Button type="button" size="sm" onClick={handleSave} disabled={disabled || !hasContent || !signerName.trim() || !signerEmail.trim()}>
            Save Signature
          </Button>
        </div>
      )}
    </div>
  )
}
