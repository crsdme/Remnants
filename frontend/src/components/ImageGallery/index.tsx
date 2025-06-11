import { ChevronLeft, ChevronRight, Download, RotateCw, X, ZoomIn, ZoomOut } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { cn } from '@/utils/lib/utils'

interface GalleryImage {
  id: string
  src: string
  alt: string
  fallback?: string
}

interface ImageGalleryProps {
  images: GalleryImage[]
  className?: string
}

export default function ImageGallery({ images, className }: ImageGalleryProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({})
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)

  if (!images || images.length === 0)
    return null

  const currentImage = images[currentIndex]

  const handleImageError = (imageId: string) => {
    setImageErrors(prev => ({ ...prev, [imageId]: true }))
  }

  const openLightbox = (index: number) => {
    setCurrentIndex(index)
    setIsOpen(true)
    setZoom(1)
    setRotation(0)
  }

  const closeLightbox = () => {
    setIsOpen(false)
    setZoom(1)
    setRotation(0)
  }

  const goToPrevious = () => {
    setCurrentIndex(prev => (prev === 0 ? images.length - 1 : prev - 1))
    setZoom(1)
    setRotation(0)
  }

  const goToNext = () => {
    setCurrentIndex(prev => (prev === images.length - 1 ? 0 : prev + 1))
    setZoom(1)
    setRotation(0)
  }

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5))
  }

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360)
  }

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = currentImage.src
    link.download = `image-${currentIndex + 1}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen)
        return

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
  }, [isOpen])

  const getImageSrc = (image: GalleryImage, size?: number) => {
    return imageErrors[image.src] && image.fallback ? image.fallback : `${image.src}${size ? `?width=${size}&height=${size}` : ''}`
  }

  return (
    <>
      <div className={cn('flex', className)}>
          <div
            key={images[0].src}
            className="relative aspect-square cursor-pointer group overflow-hidden rounded-lg border"
            onClick={() => openLightbox(0)}
          >
            <img
              src={getImageSrc(images[0], 80) || '/placeholder.svg'}
              alt={images[0].alt}
              className="object-cover h-full transition-transform group-hover:scale-105"
              onError={() => handleImageError(images[0].id)}
              width={80}
              height={80}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center"></div>
          </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 border-0">
          <div className="relative w-full h-full flex flex-col">
            {/* Header Controls */}
            <div className="absolute top-4 left-4 right-4 z-50 flex justify-between items-center">
              <div className="text-white/80 text-sm font-medium px-3 py-1 rounded-full">
                {currentIndex + 1}
                /
                {images.length}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={closeLightbox}
                className="text-white hover:bg-white/20 rounded-full"
              >
                <X className="w-6 h-6" />
              </Button>
            </div>

            {/* Main Image Container */}
            <div className="flex-1 flex items-center justify-center p-16 overflow-hidden bg-transparent">
              <div
                className="relative max-w-full max-h-full transition-transform duration-200"
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                  transformOrigin: 'center',
                }}
              >
                <img
                  src={getImageSrc(currentImage) || '/placeholder.svg'}
                  alt={currentImage.alt}
                  width={800}
                  height={600}
                  className="max-w-full max-h-full object-contain"
                  onError={() => handleImageError(currentImage.id)}
                />
              </div>
            </div>

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={goToPrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 rounded-full w-12 h-12"
                >
                  <ChevronLeft className="w-8 h-8" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={goToNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 rounded-full w-12 h-12"
                >
                  <ChevronRight className="w-8 h-8" />
                </Button>
              </>
            )}

            {/* Bottom Controls */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50">
              <div className="flex items-center gap-2 bg-black/70 rounded-full px-4 py-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleZoomOut}
                  disabled={zoom <= 0.5}
                  className="text-white hover:bg-white/20 rounded-full w-8 h-8"
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <span className="text-white text-sm min-w-[3rem] text-center">
                  {Math.round(zoom * 100)}
                  %
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleZoomIn}
                  disabled={zoom >= 3}
                  className="text-white hover:bg-white/20 rounded-full w-8 h-8"
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <div className="w-px h-6 bg-white/30 mx-1" />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRotate}
                  className="text-white hover:bg-white/20 rounded-full w-8 h-8"
                >
                  <RotateCw className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDownload}
                  className="text-white hover:bg-white/20 rounded-full w-8 h-8"
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
