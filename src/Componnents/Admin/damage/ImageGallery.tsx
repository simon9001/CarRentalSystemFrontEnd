// components/damage/ImageGallery.tsx
import React, { useState } from 'react'
import { X, ZoomIn, Download, ChevronLeft, ChevronRight } from 'lucide-react'

interface ImageGalleryProps {
  images: string[]
  onClose: () => void
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, onClose }) => {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)

  const currentImage = images[selectedIndex]

  const nextImage = () => {
    setSelectedIndex((prev) => (prev + 1) % images.length)
    setIsZoomed(false)
  }

  const prevImage = () => {
    setSelectedIndex((prev) => (prev - 1 + images.length) % images.length)
    setIsZoomed(false)
  }

  const downloadImage = () => {
    if (currentImage) {
      const link = document.createElement('a')
      link.href = currentImage
      link.download = `damage-photo-${selectedIndex + 1}.jpg`
      link.click()
    }
  }

  if (!images || images.length === 0) return null

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-6xl max-h-[90vh] p-0 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold">
              Damage Photos ({selectedIndex + 1} of {images.length})
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsZoomed(!isZoomed)}
              className="btn btn-ghost btn-circle"
              title={isZoomed ? 'Zoom Out' : 'Zoom In'}
            >
              <ZoomIn size={20} />
            </button>
            <button 
              onClick={downloadImage}
              className="btn btn-ghost btn-circle"
              title="Download"
            >
              <Download size={20} />
            </button>
            <button 
              onClick={onClose}
              className="btn btn-ghost btn-circle"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Main Image */}
        <div className="flex-1 flex items-center justify-center bg-black relative overflow-hidden">
          <img 
            src={currentImage}
            alt={`Damage photo ${selectedIndex + 1}`}
            className={`max-w-full max-h-full object-contain cursor-${isZoomed ? 'zoom-out' : 'zoom-in'} transition-transform duration-300 ${
              isZoomed ? 'scale-150' : 'scale-100'
            }`}
            onClick={() => setIsZoomed(!isZoomed)}
          />

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button 
                onClick={prevImage}
                className="absolute left-4 btn btn-circle btn-ghost text-white"
              >
                <ChevronLeft size={24} />
              </button>
              <button 
                onClick={nextImage}
                className="absolute right-4 btn btn-circle btn-ghost text-white"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}
        </div>

        {/* Thumbnail Strip */}
        {images.length > 1 && (
          <div className="p-4 border-t bg-gray-50">
            <div className="flex gap-2 overflow-x-auto">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedIndex(index)}
                  className={`flex-shrink-0 w-16 h-16 border-2 rounded-lg overflow-hidden ${
                    index === selectedIndex ? 'border-blue-500' : 'border-transparent'
                  }`}
                >
                  <img 
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ImageGallery