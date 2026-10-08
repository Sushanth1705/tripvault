import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api'
import ImageViewerModal from '../components/ImageViewerModal'

const formatDate = (value) => value
  ? new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
  : ''

export default function Profile() {
  const { username } = useParams()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  // Image viewer state for profile photos
  const [viewerOpen, setViewerOpen] = useState(false)
  const [viewerIndex, setViewerIndex] = useState(0)

  useEffect(() => {
    setLoading(true)
    setError('')
    api.get(`/users/${username}/profile`)
      .then(response => {
        setData(response.data)
      })
      .catch(() => {
        setError('Traveller profile not found or unavailable.')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [username])

  const profilePhotos = data?.trips
    ? data.trips.map(t => t.coverImage).filter(Boolean)
    : []

  const handleOpenViewer = (photoUrl) => {
    const idx = profilePhotos.indexOf(photoUrl)
    setViewerIndex(idx >= 0 ? idx : 0)
    setViewerOpen(true)
  }

  if (loading) {
    return (
      <main className="public-page">
        <div className="page-state">
          <span className="spinner" />
          <p>Loading traveller journal...</p>
        </div>
      </main>
    )
  }

  if (error || !data) {
    return (
      <main className="public-page">
        <Link to="/" className="back-link">← Return to TripVault</Link>
        <div className="empty-state error-state-box">
          <span className="empty-icon">🗺️</span>
          <h2>Profile Not Found</h2>
          <p>{error || 'This traveller profile does not exist.'}</p>
          <Link to="/" className="primary-btn">Go to Dashboard</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="public-page">
      <div className="profile-header-card">
        <Link to="/" className="back-link">
          ← TripVault
        </Link>
        <div className="profile-user-badge">
          <div className="profile-avatar">
            {data.user.name ? data.user.name.charAt(0).toUpperCase() : 'T'}
          </div>
          <div>
            <p className="eyebrow">Traveller Archive</p>
            <h1 className="profile-name">{data.user.name}</h1>
            <p className="profile-username">@{data.user.username}</p>
          </div>
        </div>

        {data.user.bio && (
          <p className="profile-bio">{data.user.bio}</p>
        )}

        <div className="profile-stats-strip">
          <span className="profile-stat-badge">
            🎒 {data.trips.length} {data.trips.length === 1 ? 'shared memory' : 'shared memories'}
          </span>
          <span className="profile-stat-badge">
            📸 {profilePhotos.length} photos
          </span>
        </div>
      </div>

      <section className="profile-trips-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Shared Journeys</p>
            <h2>Public Memories</h2>
          </div>
        </div>

        {data.trips.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">🌄</span>
            <h3>No public trips yet</h3>
            <p>This traveller has not shared any public journeys yet.</p>
          </div>
        ) : (
          <div className="trip-grid">
            {data.trips.map(trip => (
              <article className="trip-card profile-card" key={trip._id}>
                {trip.coverImage ? (
                  <div
                    className="trip-cover-wrap"
                    onClick={() => handleOpenViewer(trip.coverImage)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleOpenViewer(trip.coverImage) }}
                    title="Click to view full photo"
                  >
                    <img className="trip-cover" src={trip.coverImage} alt={trip.title} loading="lazy" />
                    <div className="cover-hover-prompt">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        <line x1="11" y1="8" x2="11" y2="14"></line>
                        <line x1="8" y1="11" x2="14" y2="11"></line>
                      </svg>
                      <span>View Image</span>
                    </div>
                  </div>
                ) : (
                  <div className="trip-cover-placeholder">
                    <span className="placeholder-icon">🗺️</span>
                    <span className="placeholder-text">{trip.destination}</span>
                  </div>
                )}

                <div className="trip-card-body">
                  <div className="trip-card-top">
                    <div>
                      <h3 className="trip-card-title">{trip.title}</h3>
                      <p className="destination">📍 {trip.destination}</p>
                    </div>
                    {trip.rating && (
                      <span className="rating">★ {trip.rating}/5</span>
                    )}
                  </div>

                  {(trip.startDate || trip.endDate) && (
                    <p className="trip-dates">
                      {formatDate(trip.startDate)} {trip.endDate ? `→ ${formatDate(trip.endDate)}` : ''}
                    </p>
                  )}

                  {trip.description && (
                    <p className="trip-description">{trip.description}</p>
                  )}

                  {trip.coverImage && (
                    <div className="trip-actions">
                      <button
                        type="button"
                        className="secondary-btn"
                        onClick={() => handleOpenViewer(trip.coverImage)}
                      >
                        🔍 View Photo
                      </button>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Lightbox for profile photos */}
      <ImageViewerModal
        images={profilePhotos}
        initialIndex={viewerIndex}
        title={`Photos by @${data.user.username}`}
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
      />
    </main>
  )
}
