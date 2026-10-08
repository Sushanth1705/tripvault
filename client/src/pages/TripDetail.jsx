import { useEffect, useState, useRef } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'
import ImageViewerModal from '../components/ImageViewerModal'
import TripForm from '../components/TripForm'

const formatDate = (value) => {
  if (!value) return 'Date not set'
  return new Date(value).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

const calculateDuration = (start, end) => {
  if (!start || !end) return null
  const diffTime = Math.abs(new Date(end) - new Date(start))
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays === 1 ? '1 day' : `${diffDays} days`
}

export default function TripDetail() {
  const { id } = useParams()
  const { axiosInstance } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [trip, setTrip] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [savingEdit, setSavingEdit] = useState(false)

  // Image viewer state
  const [viewerOpen, setViewerOpen] = useState(false)
  const [viewerIndex, setViewerIndex] = useState(0)

  const fileInputRef = useRef(null)

  const fetchTrip = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await axiosInstance.get(`/trips/${id}`)
      setTrip(response.data.trip)
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Trip not found or may have been deleted.')
      } else {
        setError(err.response?.data?.message || 'Trip details are unavailable.')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTrip()
  }, [id])

  // Collect all photos (cover + photos array without duplicates)
  const allPhotos = trip
    ? Array.from(new Set([trip.coverImage, ...(trip.photos || [])])).filter(Boolean)
    : []

  const handleOpenViewer = (index = 0) => {
    setViewerIndex(index)
    setViewerOpen(true)
  }

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file', 'error')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image must be smaller than 5 MB', 'error')
      return
    }

    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('image', file)
      const response = await axiosInstance.post(`/trips/${id}/upload`, formData)
      setTrip(response.data.trip)
      showToast('Photo uploaded successfully! 🎉')
      // Auto open image viewer so user sees their new image immediately
      setViewerIndex(0)
      setViewerOpen(true)
    } catch (uploadErr) {
      const msg = uploadErr.response?.data?.message || 'Failed to upload photo. Check Cloudinary settings.'
      showToast(msg, 'error')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleSaveEdit = async (updatedData) => {
    try {
      setSavingEdit(true)
      const { image, ...data } = updatedData
      const response = await axiosInstance.put(`/trips/${id}`, data)
      if (image) {
        const formData = new FormData()
        formData.append('image', image)
        await axiosInstance.post(`/trips/${id}/upload`, formData)
      }
      showToast('Trip updated successfully.')
      setEditOpen(false)
      await fetchTrip()
      return true
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not update trip', 'error')
      return false
    } finally {
      setSavingEdit(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${trip.title}"?`)) return
    try {
      await axiosInstance.delete(`/trips/${id}`)
      showToast('Trip deleted.')
      navigate('/dashboard')
    } catch (err) {
      showToast(err.response?.data?.message || 'Unable to delete trip.', 'error')
    }
  }

  if (loading) {
    return (
      <main className="public-page trip-detail-page">
        <div className="trip-detail-skeleton">
          <div className="skeleton-hero" />
          <div className="skeleton-line skeleton-title" />
          <div className="skeleton-line skeleton-text" />
          <div className="skeleton-line skeleton-text" />
        </div>
      </main>
    )
  }

  if (error || !trip) {
    return (
      <main className="public-page">
        <Link to="/dashboard" className="back-link">
          ← Back to My Trips
        </Link>
        <div className="empty-state error-state-box">
          <span className="empty-icon">⚠️</span>
          <h2>Unable to view trip</h2>
          <p>{error || 'This trip does not exist.'}</p>
          <button className="primary-btn" onClick={() => navigate('/dashboard')}>
            Return to Dashboard
          </button>
        </div>
      </main>
    )
  }

  const duration = calculateDuration(trip.startDate, trip.endDate)

  return (
    <main className="public-page trip-detail-page">
      {/* Top Navigation Bar */}
      <div className="detail-top-bar">
        <Link to="/dashboard" className="back-link">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          <span>Back to My Trips</span>
        </Link>

        <div className="detail-action-buttons">
          <button
            type="button"
            className="secondary-btn"
            onClick={() => setEditOpen(true)}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            <span>Edit</span>
          </button>
          <button
            type="button"
            className="danger-btn"
            onClick={handleDelete}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
            <span>Delete</span>
          </button>
        </div>
      </div>

      {editOpen && (
        <div className="detail-edit-modal-wrapper">
          <TripForm
            trip={trip}
            onSubmit={handleSaveEdit}
            onCancel={() => setEditOpen(false)}
            loading={savingEdit}
          />
        </div>
      )}

      {/* Hero Showcase Card */}
      <section className="trip-detail-hero">
        {trip.coverImage ? (
          <div
            className="hero-image-container"
            onClick={() => handleOpenViewer(0)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter') handleOpenViewer(0) }}
            title="Click to view full image in high resolution"
          >
            <img
              src={trip.coverImage}
              alt={trip.title}
              className="hero-cover-img"
              loading="eager"
            />
            <div className="hero-gradient-overlay" />
            <button
              type="button"
              className="hero-zoom-badge"
              onClick={(e) => {
                e.stopPropagation()
                handleOpenViewer(0)
              }}
              aria-label="View image full screen"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                <line x1="11" y1="8" x2="11" y2="14"></line>
                <line x1="8" y1="11" x2="14" y2="11"></line>
              </svg>
              <span>View Full Photo</span>
            </button>
          </div>
        ) : (
          <div className="hero-placeholder-banner">
            <div className="hero-placeholder-content">
              <span className="hero-placeholder-icon">🗺️</span>
              <h3>No cover photo yet</h3>
              <p>Add a photo to bring your memories to life.</p>
              <label className="primary-btn hero-upload-btn">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  style={{ display: 'none' }}
                />
                {uploading ? 'Uploading Photo...' : '📷 Upload Cover Photo'}
              </label>
            </div>
          </div>
        )}

        <div className="hero-details-card">
          <div className="hero-badge-row">
            <span className="destination-badge">
              📍 {trip.destination}
            </span>
            {duration && (
              <span className="duration-badge">
                ⏱️ {duration}
              </span>
            )}
            {trip.rating && (
              <span className="rating-badge">
                ★ {trip.rating} / 5
              </span>
            )}
          </div>

          <h1 className="trip-detail-title">{trip.title}</h1>

          <div className="trip-meta-info">
            <div className="meta-item">
              <span className="meta-label">Dates</span>
              <span className="meta-value">
                {formatDate(trip.startDate)} <span>→</span> {formatDate(trip.endDate)}
              </span>
            </div>
            {trip.createdAt && (
              <div className="meta-item">
                <span className="meta-label">Recorded On</span>
                <span className="meta-value">
                  {formatDate(trip.createdAt)}
                </span>
              </div>
            )}
          </div>

          {trip.description ? (
            <div className="trip-story-section">
              <h3>Memory & Journal</h3>
              <p className="trip-story-text">{trip.description}</p>
            </div>
          ) : (
            <div className="trip-story-empty">
              <p>No story written yet for this trip. Click "Edit" above to record your thoughts!</p>
            </div>
          )}
        </div>
      </section>

      {/* Photo Gallery Section */}
      <section className="trip-photos-section">
        <div className="section-header-split">
          <div>
            <p className="eyebrow">Visual Memories</p>
            <h2>Photo Gallery ({allPhotos.length})</h2>
          </div>

          <div className="gallery-header-actions">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
            <button
              type="button"
              className="primary-btn add-photo-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span>{uploading ? 'Uploading...' : 'Add Photo'}</span>
            </button>
          </div>
        </div>

        {allPhotos.length === 0 ? (
          <div className="empty-gallery-card">
            <span className="empty-gallery-icon">📸</span>
            <h3>No Photos Uploaded</h3>
            <p>Upload your vacation snaps, landmarks, or scenery to view them here anytime.</p>
            <button
              type="button"
              className="secondary-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Upload First Photo'}
            </button>
          </div>
        ) : (
          <div className="photo-gallery-grid">
            {allPhotos.map((photo, index) => (
              <div
                key={photo + index}
                className="gallery-item-card"
                onClick={() => handleOpenViewer(index)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter') handleOpenViewer(index) }}
                title="Click to view full image"
              >
                <img
                  src={photo}
                  alt={`${trip.title} photo ${index + 1}`}
                  className="gallery-thumbnail"
                  loading="lazy"
                />
                <div className="gallery-hover-overlay">
                  <div className="gallery-overlay-content">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                      <line x1="11" y1="8" x2="11" y2="14"></line>
                      <line x1="8" y1="11" x2="14" y2="11"></line>
                    </svg>
                    <span>View Image</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Fullscreen Interactive Lightbox Modal */}
      <ImageViewerModal
        images={allPhotos}
        initialIndex={viewerIndex}
        title={`${trip.title} (${trip.destination})`}
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
      />
    </main>
  )
}
