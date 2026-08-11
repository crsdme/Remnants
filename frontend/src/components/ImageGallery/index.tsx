import { ChevronLeft, ChevronRight, Download, ImageIcon, RotateCw, X, ZoomIn, ZoomOut } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

import { Button, Dialog, DialogContent, DialogTitle } from '@/components/ui'

import { cn } from '@/utils/lib'

interface GalleryImage {
  id: string
  src: string
  alt: string
  fallback?: string
}

interface ImageGalleryProps {
  images: GalleryImage[]
  className?: string
  size?: number
}

function GalleryFallback({
  size,
  className,
  label,
}: {
  size: number
  className?: string
  label?: string
}) {
  const iconSize = Math.max(16, Math.min(40, Math.round(size * 0.32)))

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-2 bg-muted/60 text-muted-foreground',
        className,
      )}
      style={{ width: size, height: size }}
    >
      <ImageIcon style={{ width: iconSize, height: iconSize }} className="opacity-40" strokeWidth={1.5} />
      {label && (
        <span className="max-w-[80%] text-center text-sm text-muted-foreground/80">
          {label}
        </span>
      )}
    </div>
  )
}

export function ImageGallery({ images, className, size = 80 }: ImageGalleryProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [failedIds, setFailedIds] = useState<Set<string>>(() => new Set())
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)

  const hasImages = images.length > 0
  const currentImage = hasImages ? images[currentIndex] : undefined
  const currentFailed = currentImage ? failedIds.has(currentImage.id) : true
  const canShowCurrent = Boolean(currentImage && (!currentFailed || currentImage.fallback))

  const markFailed = useCallback((imageId: string) => {
    setFailedIds((prev) => {
      if (prev.has(imageId))
        return prev
      const next = new Set(prev)
      next.add(imageId)
      return next
    })
  }, [])

  const getImageSrc = useCallback((image: GalleryImage, thumbSize?: number) => {
    if (failedIds.has(image.id) && image.fallback)
      return image.fallback

    if (thumbSize)
      return `${image.src}?width=${thumbSize}&height=${thumbSize}`

    return image.src
  }, [failedIds])

  const resetView = useCallback(() => {
    setZoom(1)
    setRotation(0)
  }, [])

  const openLightbox = (index: number) => {
    if (!hasImages)
      return
    setCurrentIndex(index)
    setIsOpen(true)
    resetView()
  }

  const closeLightbox = useCallback(() => {
    setIsOpen(false)
    resetView()
  }, [resetView])

  const goToPrevious = useCallback(() => {
    setCurrentIndex(prev => (prev === 0 ? images.length - 1 : prev - 1))
    resetView()
  }, [images.length, resetView])

  const goToNext = useCallback(() => {
    setCurrentIndex(prev => (prev === images.length - 1 ? 0 : prev + 1))
    resetView()
  }, [images.length, resetView])

  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + 0.25, 3))
  }, [])

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - 0.25, 0.5))
  }, [])

  const handleRotate = useCallback(() => {
    setRotation(prev => (prev + 90) % 360)
  }, [])

  const handleDownload = useCallback(() => {
    if (!currentImage?.src || failedIds.has(currentImage.id))
      return

    const link = document.createElement('a')
    link.href = currentImage.src
    link.download = currentImage.alt || `image-${currentIndex + 1}.jpg`
    link.rel = 'noopener'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [currentImage, currentIndex, failedIds])

  useEffect(() => {
    if (!isOpen)
      return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          closeLightbox()
          break
        case 'ArrowLeft':
          goToPrevious()
          break
        case 'ArrowRight':
          goToNext()
          break
        case '+':
        case '=':
          handleZoomIn()
          break
        case '-':
          handleZoomOut()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, closeLightbox, goToPrevious, goToNext, handleZoomIn, handleZoomOut])

  const thumb = images[0]
  const thumbFailed = thumb ? failedIds.has(thumb.id) : true
  const showThumbFallback = !thumb || (thumbFailed && !thumb.fallback)

  return (
    <>
      <div className={cn('flex', className)}>
        <div
          className={cn(
            'relative overflow-hidden rounded-md border bg-muted/40',
            hasImages && 'cursor-pointer group',
          )}
          style={{ width: size, height: size }}
          onClick={() => openLightbox(0)}
          role={hasImages ? 'button' : undefined}
          tabIndex={hasImages ? 0 : undefined}
          onKeyDown={(e) => {
            if (hasImages && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault()
              openLightbox(0)
            }
          }}
        >
          {showThumbFallback
            ? (
                <GalleryFallback size={size} />
              )
            : (
                <img
                  src={getImageSrc(thumb, size)}
                  alt={thumb.alt || ''}
                  className="size-full object-cover transition-transform group-hover:scale-105"
                  onError={() => markFailed(thumb.id)}
                  width={size}
                  height={size}
                />
              )}

          {hasImages && !showThumbFallback && (
            <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
          )}

          {images.length > 1 && (
            <span className="absolute bottom-1 right-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] leading-none text-white">
              {images.length}
            </span>
          )}
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          className={cn(
            'max-h-[95vh] w-auto max-w-[95vw] border-0 bg-transparent p-0 shadow-none',
            '[&>button]:hidden',
          )}
        >
          <DialogTitle className="sr-only">
            {currentImage?.alt || 'Image gallery'}
          </DialogTitle>

          <div className="relative flex min-h-[min(70vh,560px)] min-w-[min(90vw,480px)] flex-col items-center justify-center">
            <div className="absolute left-0 right-0 top-0 z-50 flex items-center justify-between px-1">
              <div className="rounded-full bg-black/70 px-3 py-1 text-sm font-medium text-white/90 backdrop-blur-sm">
                {currentIndex + 1}
                /
                {images.length}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={closeLightbox}
                className="size-9 rounded-full bg-black/70 text-white backdrop-blur-sm hover:bg-black/60 hover:text-white"
              >
                <X className="size-5" />
              </Button>
            </div>

            <div className="flex flex-1 items-center justify-center px-14 py-16">
              {canShowCurrent && currentImage
                ? (
                    <div
                      className="relative max-h-[75vh] max-w-[85vw] transition-transform duration-200"
                      style={{
                        transform: `scale(${zoom}) rotate(${rotation}deg)`,
                        transformOrigin: 'center',
                      }}
                    >
                      <img
                        src={getImageSrc(currentImage)}
                        alt={currentImage.alt}
                        className="max-h-[75vh] max-w-[85vw] rounded-md object-contain shadow-2xl"
                        onError={() => markFailed(currentImage.id)}
                      />
                    </div>
                  )
                : (
                    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border/60 bg-background/95 px-10 py-12 shadow-xl backdrop-blur-sm">
                      <div className="flex size-16 items-center justify-center rounded-full bg-muted">
                        <ImageIcon className="size-7 text-muted-foreground/60" strokeWidth={1.5} />
                      </div>
                      <p className="text-sm text-muted-foreground">Image unavailable</p>
                    </div>
                  )}
            </div>

            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={goToPrevious}
                  className="absolute left-0 top-1/2 size-11 -translate-y-1/2 rounded-full bg-black/70 text-white backdrop-blur-sm hover:bg-black/60 hover:text-white"
                >
                  <ChevronLeft className="size-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={goToNext}
                  className="absolute right-0 top-1/2 size-11 -translate-y-1/2 rounded-full bg-black/70 text-white backdrop-blur-sm hover:bg-black/60 hover:text-white"
                >
                  <ChevronRight className="size-6" />
                </Button>
              </>
            )}

            {canShowCurrent && (
              <div className="absolute bottom-0 left-1/2 z-50 -translate-x-1/2">
                <div className="flex items-center gap-1 rounded-full bg-black/70 px-3 py-1.5 backdrop-blur-sm">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleZoomOut}
                    disabled={zoom <= 0.5}
                    className="size-8 rounded-full text-white hover:bg-white/20 hover:text-white"
                  >
                    <ZoomOut className="size-4" />
                  </Button>
                  <span className="min-w-12 text-center text-sm text-white">
                    {Math.round(zoom * 100)}
                    %
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleZoomIn}
                    disabled={zoom >= 3}
                    className="size-8 rounded-full text-white hover:bg-white/20 hover:text-white"
                  >
                    <ZoomIn className="size-4" />
                  </Button>
                  <div className="mx-1 h-5 w-px bg-white/30" />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleRotate}
                    className="size-8 rounded-full text-white hover:bg-white/20 hover:text-white"
                  >
                    <RotateCw className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleDownload}
                    className="size-8 rounded-full text-white hover:bg-white/20 hover:text-white"
                  >
                    <Download className="size-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
