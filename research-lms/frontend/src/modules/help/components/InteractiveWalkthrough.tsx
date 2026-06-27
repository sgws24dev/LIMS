import { useState, useEffect, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { X, ChevronLeft, ChevronRight, Check } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/shared/ui/card'
import {
  getActiveWalkthroughs,
  completeWalkthrough,
  skipWalkthrough,
  saveWalkthroughProgress,
  getWalkthroughProgress,
  type WalkthroughDto,
  type WalkthroughStepDto
} from '@/services/api/content'

interface InteractiveWalkthroughProps {
  previewMode?: boolean
  previewWalkthroughId?: string
}

export function InteractiveWalkthrough({ previewMode, previewWalkthroughId }: InteractiveWalkthroughProps) {
  const location = useLocation()
  const [walkthroughs, setWalkthroughs] = useState<WalkthroughDto[]>([])
  const [activeWalkthrough, setActiveWalkthrough] = useState<WalkthroughDto | null>(null)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)

  const selectWalkthrough = useCallback(async (data: WalkthroughDto[]) => {
    if (data.length === 0) return
    const wt = data[0]
    setActiveWalkthrough(wt)
    try {
      const progress = await getWalkthroughProgress(wt.id)
      if (progress && progress.currentStepIndex != null && progress.status === 'InProgress') {
        setCurrentStepIndex(Math.min(progress.currentStepIndex, wt.steps.length - 1))
      } else {
        setCurrentStepIndex(0)
      }
    } catch {
      setCurrentStepIndex(0)
    }
  }, [])

  useEffect(() => {
    if (previewMode && previewWalkthroughId) return
    getActiveWalkthroughs(location.pathname)
      .then((data) => {
        setWalkthroughs(data)
        selectWalkthrough(data)
      })
      .catch(() => { /* ignore */ })
  }, [location.pathname, previewMode, previewWalkthroughId, selectWalkthrough])

  const currentStep: WalkthroughStepDto | null =
    activeWalkthrough?.steps[currentStepIndex] ?? null

  useEffect(() => {
    if (!currentStep?.elementSelector) {
      setTargetRect(null)
      return
    }
    const el = document.querySelector(currentStep.elementSelector)
    if (el) {
      setTargetRect(el.getBoundingClientRect())
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    } else {
      setTargetRect(null)
    }
  }, [currentStep])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeWalkthrough) {
        handleDismiss()
      }
    }
    if (activeWalkthrough) {
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }
  }, [activeWalkthrough])

  const handleNext = useCallback(async () => {
    if (!activeWalkthrough) return
    const nextIndex = currentStepIndex + 1
    if (nextIndex < activeWalkthrough.steps.length) {
      setCurrentStepIndex(nextIndex)
      try {
        await saveWalkthroughProgress(activeWalkthrough.id, nextIndex)
      } catch { /* ignore */ }
    }
  }, [activeWalkthrough, currentStepIndex])

  const handlePrev = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((i) => i - 1)
    }
  }, [currentStepIndex])

  const handleComplete = useCallback(() => {
    if (!activeWalkthrough) return
    completeWalkthrough(activeWalkthrough.id).catch(() => { /* ignore */ })
    setActiveWalkthrough(null)
    setCurrentStepIndex(0)
  }, [activeWalkthrough])

  const handleDismiss = useCallback(() => {
    if (!activeWalkthrough) return
    skipWalkthrough(activeWalkthrough.id).catch(() => { /* ignore */ })
    setActiveWalkthrough(null)
    setCurrentStepIndex(0)
  }, [activeWalkthrough])

  if (!currentStep || !activeWalkthrough) return null

  const isLastStep = currentStepIndex === activeWalkthrough.steps.length - 1

  const getPlacementStyle = (placement: string, target: DOMRect | null): React.CSSProperties => {
    const gap = 12
    if (!target) return { bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: `${gap}px` }

    switch (placement) {
      case 'top':
        return { left: `${target.left + target.width / 2}px`, bottom: `${window.innerHeight - target.top + gap}px`, transform: 'translateX(-50%)' }
      case 'bottom':
        return { left: `${target.left + target.width / 2}px`, top: `${target.bottom + gap}px`, transform: 'translateX(-50%)' }
      case 'left':
        return { top: `${target.top + target.height / 2}px`, right: `${window.innerWidth - target.left + gap}px`, transform: 'translateY(-50%)' }
      case 'right':
        return { top: `${target.top + target.height / 2}px`, left: `${target.right + gap}px`, transform: 'translateY(-50%)' }
      default:
        return { left: `${target.left + target.width / 2}px`, bottom: `${window.innerHeight - target.top + gap}px`, transform: 'translateX(-50%)' }
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-50">
        <div className="absolute inset-0 bg-black/40" onClick={handleDismiss} />

        {targetRect && currentStep.elementSelector && (
          <div
            className="absolute z-40 pointer-events-none"
            style={{
              left: targetRect.left - 4,
              top: targetRect.top - 4,
              width: targetRect.width + 8,
              height: targetRect.height + 8,
              boxShadow: '0 0 0 9999px rgba(0,0,0,0.4), 0 0 0 2px hsl(var(--primary))',
              borderRadius: '6px',
            }}
          />
        )}

        <div
          className="absolute z-50"
          style={{
            ...getPlacementStyle(currentStep.placement, targetRect),
            position: 'fixed',
          }}
        >
          <Card className="w-80 shadow-xl">
            <CardHeader className="pb-2 flex-row items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                {activeWalkthrough.name} ({currentStepIndex + 1}/{activeWalkthrough.steps.length})
              </span>
              <Button variant="ghost" size="icon-sm" onClick={handleDismiss}>
                <X className="h-3 w-3" />
              </Button>
            </CardHeader>
            <CardContent className="pb-2">
              <h4 className="font-medium text-sm mb-1">{currentStep.title}</h4>
              <p className="text-xs text-muted-foreground">{currentStep.content}</p>
            </CardContent>
            <CardFooter className="flex justify-between pt-2">
              <Button variant="ghost" size="sm" onClick={handlePrev} disabled={currentStepIndex === 0}>
                <ChevronLeft className="mr-1 h-3 w-3" />
                Back
              </Button>
              {isLastStep ? (
                <Button size="sm" onClick={handleComplete}>
                  <Check className="mr-1 h-3 w-3" />
                  Done
                </Button>
              ) : (
                <Button size="sm" onClick={handleNext}>
                  Next
                  <ChevronRight className="ml-1 h-3 w-3" />
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </>
  )
}