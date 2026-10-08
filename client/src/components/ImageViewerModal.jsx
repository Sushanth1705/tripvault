import React, { useEffect, useState, useCallback } from 'react'

export default function ImageViewerModal({
  images = [],
  initialIndex = 0,
  title = '',
  isOpen,
  onClose
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [zoomLevel, setZoomLevel] = useState(1)

  useEffect(() => {
    setCurrentIndex(initialIndex)
    setZoomLevel(1)
  }, [initialIndex, isOpen])

  const normalizedImages = Array.isArray(images)
    ? images.filter(Boolean)
    : images
    ? [images]
    : []

  const currentImage = normalizedImages[currentIndex] || ''

  const handleNext = useCallback(() => {
    if (normalizedImages.length <= 1) return
    setCurrentIndex(prev => (prev + 1) % normalizedImages.length)
    setZoomLevel(1)
  }, [normalizedImages.length])

  const handlePrev = useCallback(() => {
    if (normalizedImages.length <= 1) return
    setCurrentIndex(prev => (prev - 1 + normalizedImages.length) % normalizedImages.length)
    setZoomLevel(1)
  }, [normalizedImages.length])

  const handleKeyDown = useCallback(
    (e) => {
      if (!isOpen) return
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight') handleNext()
      else if (e.key === 'ArrowLeft') handlePrev()
    },
    [isOpen, onClose, handleNext, handlePrev]
  )

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, handleKeyDown])

  if (!isOpen || !currentImage) return null

  const zoomIn = () => setZoomLevel(prev => Math.min(prev + 0.35, 3))
  const zoomOut = () => setZoomLevel(prev => Math.max(prev - 0.35, 0.7))
  const resetZoom = () => setZoomLevel(1)

  return (
    <div
      className="image-viewer-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Image Preview"
    >
      <div className="image-viewer-topbar">
        <div className="image-viewer-info">
          {title && <span className="image-viewer-title">{title}</span>}
          {normalizedImages.length > 1 && (
            <span className="image-viewer-counter">
              {currentIndex + 1} / {normalizedImages.length}
            </span>
          )}
        </div>

        <div className="image-viewer-controls">
          <button
            type="button"
            className="viewer-btn"
            onClick={zoomOut}
            title="Zoom Out"
            aria-label="Zoom out"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              <line x1="8" y1="11" x2="14" y2="11"></line>
            </svg>
          </button>
          <button
            type="button"
            className="viewer-btn viewer-zoom-reset"
            onClick={resetZoom}
            title="Reset Zoom"
            aria-label="Reset zoom"
          >
            {Math.round(zoomLevel * 100)}%
          </button>
          <button
            type="button"
            className="viewer-btn"
            onClick={zoomIn}
            title="Zoom In"
            aria-label="Zoom in"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              <line x1="11" y1="8" x2="11" y2="14"></line>
              <line x1="8" y1="11" x2="14" y2="11"></line>
            </svg>
          </button>
          <a
            href={currentImage}
            target="_blank"
            rel="noopener noreferrer"
            className="viewer-btn"
            title="Open Full Image in New Tab"
            aria-label="Open full image in new tab"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </a>
          <button
            type="button"
            className="viewer-btn viewer-close-btn"
            onClick={onClose}
            title="Close (Esc)"
            aria-label="Close image viewer"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>

      <div className="image-viewer-stage">
        {normalizedImages.length > 1 && (
          <button
            type="button"
            className="viewer-nav-btn viewer-prev"
            onClick={handlePrev}
            aria-label="Previous image"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
        )}

        <div className="image-viewer-img-wrapper">
          <img
            src={currentImage}
            alt={title || 'Trip view'}
            className="image-viewer-img"
            style={{ transform: `scale(${zoomLevel})` }}
            loading="eager"
          />
        </div>

        {normalizedImages.length > 1 && (
          <button
            type="button"
            className="viewer-nav-btn viewer-next"
            onClick={handleNext}
            aria-label="Next image"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        )}
      </div>

      {normalizedImages.length > 1 && (
        <div className="image-viewer-thumbnails">
          {normalizedImages.map((thumb, idx) => (
            <button
              key={thumb + idx}
              type="button"
              className={`viewer-thumb-btn ${idx === currentIndex ? 'active' : ''}`}
              onClick={() => {
                setCurrentIndex(idx)
                setZoomLevel(1)
              }}
              aria-label={`View photo ${idx + 1}`}
            >
              <img src={thumb} alt={`Thumbnail ${idx + 1}`} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
