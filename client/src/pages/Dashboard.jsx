import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import TripForm from '../components/TripForm'
import { useToast } from '../components/Toast'
import ImageViewerModal from '../components/ImageViewerModal'

const formatDate = (value) => value
  ? new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
  : 'Date not set'

const getApiError = (error, fallback) => {
  if (!error.response) return 'Unable to reach the server. Check your connection and try again.'
  return error.response.data?.message || fallback
}

const Dashboard = () => {
  const { user, logout, axiosInstance } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editingTrip, setEditingTrip] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState('')
  const [profileBio, setProfileBio] = useState(user?.bio || '')
  const [profileOpen, setProfileOpen] = useState(false)

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('newest')

  // Image viewer modal state for dashboard quick view
  const [activeViewerImage, setActiveViewerImage] = useState(null)
  const [activeViewerTitle, setActiveViewerTitle] = useState('')

  const fetchTrips = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await axiosInstance.get('/trips')
      setTrips(response.data.trips || [])
    } catch (requestError) {
      if (requestError.response?.status === 401) {
        logout()
        navigate('/login')
        return
      }
      setError(getApiError(requestError, 'Unable to load your trips.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTrips()
  }, [])

  const handleSave = async (tripData) => {
    try {
      setSaving(true)
      setError('')
      if (editingTrip) {
        const { image, ...data } = tripData
        const response = await axiosInstance.put(`/trips/${editingTrip._id}`, data)
        if (image) await uploadPhoto(response.data.trip._id, image)
        showToast('Trip updated successfully.')
        setFeedback('Trip updated successfully.')
      } else {
        const { image, ...data } = tripData
        const response = await axiosInstance.post('/trips', data)
        if (image) await uploadPhoto(response.data.trip._id, image)
        showToast('Trip created successfully.')
        setFeedback('Trip created successfully.')
      }

      setFormOpen(false)
      setEditingTrip(null)
      await fetchTrips()
      return true
    } catch (requestError) {
      const errMsg = getApiError(requestError, 'Unable to save this trip.')
      setError(errMsg)
      showToast(errMsg, 'error')
      return false
    } finally {
      setSaving(false)
    }
  }

  const uploadPhoto = async (tripId, image) => {
    const formData = new FormData()
    formData.append('image', image)
    await axiosInstance.post(`/trips/${tripId}/upload`, formData)
  }

  const saveProfile = async (event) => {
    event.preventDefault()
    try {
      const response = await axiosInstance.put('/users/profile', { bio: profileBio })
      setFeedback('Profile updated successfully.')
      showToast('Profile updated.')
      setProfileOpen(false)
      window.localStorage.setItem('profileUser', JSON.stringify(response.data.user))
    } catch (requestError) {
      setError(getApiError(requestError, 'Unable to update your profile.'))
      showToast(getApiError(requestError, 'Unable to update your profile.'), 'error')
    }
  }

  const handleDelete = async (trip) => {
    if (!window.confirm(`Are you sure you want to delete "${trip.title}"?`)) return

    try {
      setDeletingId(trip._id)
      setError('')
      await axiosInstance.delete(`/trips/${trip._id}`)
      showToast('Trip deleted.')
      setFeedback('Trip deleted successfully.')
      await fetchTrips()
    } catch (requestError) {
      setError(getApiError(requestError, 'Unable to delete this trip.'))
      showToast(getApiError(requestError, 'Unable to delete this trip.'), 'error')
    } finally {
      setDeletingId(null)
    }
  }

  const openCreateForm = () => {
    setEditingTrip(null)
    setFormOpen(true)
    setFeedback('')
  }

  const openEditForm = (trip) => {
    setEditingTrip(trip)
    setFormOpen(true)
    setFeedback('')
  }

  // Filter & sort trips
  const filteredTrips = useMemo(() => {
    return trips
      .filter(trip => {
        if (!searchQuery.trim()) return true
        const q = searchQuery.toLowerCase()
        return (
          trip.title?.toLowerCase().includes(q) ||
          trip.destination?.toLowerCase().includes(q) ||
          trip.description?.toLowerCase().includes(q)
        )
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        if (sortBy === 'oldest') return new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0)
        if (sortBy === 'title') return (a.title || '').localeCompare(b.title || '')
        return 0
      })
  }, [trips, searchQuery, sortBy])

  // Summary stats
  const uniqueDestinations = useMemo(() => {
    const dests = new Set(trips.map(t => t.destination?.trim().toLowerCase()).filter(Boolean))
    return dests.size
  }, [trips])

  const avgRating = useMemo(() => {
    const rated = trips.filter(t => t.rating)
    if (!rated.length) return null
    const sum = rated.reduce((acc, t) => acc + Number(t.rating), 0)
    return (sum / rated.length).toFixed(1)
  }, [trips])

  return (
    <div className="dashboard-container">
      {/* Header Banner */}
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">Your Travel Vault</p>
          <h1>Welcome back, {user?.name || 'Explorer'}</h1>
          <p className="dashboard-subtitle">
            Record the places, sights, and small details worth returning to.
          </p>
        </div>
        <div className="header-actions">
          <button className="secondary-btn" onClick={() => navigate(`/profile/${user?.username}`)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span>Public Profile</span>
          </button>
          <button className="secondary-btn" onClick={() => setProfileOpen(!profileOpen)}>
            <span>Edit Bio</span>
          </button>
          <button className="primary-btn create-btn-header" onClick={openCreateForm}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>New Trip</span>
          </button>
        </div>
      </header>

      {/* Stats Overview */}
      <div className="stats-row">
        <div className="stat-card">
          <span className="stat-value">{trips.length}</span>
          <span className="stat-label">Total Trips</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{uniqueDestinations}</span>
          <span className="stat-label">Destinations Visited</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{avgRating ? `★ ${avgRating}` : '—'}</span>
          <span className="stat-label">Average Rating</span>
        </div>
      </div>

      {feedback && <div className="success-message">{feedback}</div>}
      {error && <div className="error-message">{error}</div>}

      {profileOpen && (
        <form className="profile-editor" onSubmit={saveProfile}>
          <label htmlFor="bio">Traveller Bio</label>
          <textarea
            id="bio"
            value={profileBio}
            onChange={event => setProfileBio(event.target.value)}
            maxLength="280"
            placeholder="Tell fellow travellers about your wanderlust..."
          />
          <div className="form-actions">
            <button type="button" className="secondary-btn" onClick={() => setProfileOpen(false)}>
              Cancel
            </button>
            <button className="primary-btn" type="submit">
              Save Bio
            </button>
          </div>
        </form>
      )}

      {formOpen && (
        <TripForm
          trip={editingTrip}
          onSubmit={handleSave}
          onCancel={() => { setFormOpen(false); setEditingTrip(null) }}
          loading={saving}
        />
      )}

      {/* Search & Filter Bar */}
      <section className="trips-section">
        <div className="section-heading-wrap">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Your collection</p>
              <h2>Trips ({filteredTrips.length})</h2>
            </div>
            {!formOpen && (
              <button className="primary-btn" onClick={openCreateForm}>
                + Create Trip
              </button>
            )}
          </div>

          {trips.length > 0 && (
            <div className="filter-bar">
              <div className="search-input-wrapper">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input
                  type="text"
                  placeholder="Search by title or destination..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
                {searchQuery && (
                  <button className="search-clear-btn" onClick={() => setSearchQuery('')} aria-label="Clear search">
                    ×
                  </button>
                )}
              </div>

              <div className="sort-wrapper">
                <label htmlFor="sort-trips" className="sort-label">Sort:</label>
                <select
                  id="sort-trips"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="sort-select"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="rating">Highest Rated</option>
                  <option value="title">Alphabetical</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {loading && (
          <div className="trip-grid" aria-label="Loading trips">
            <div className="skeleton-card" />
            <div className="skeleton-card" />
            <div className="skeleton-card" />
          </div>
        )}

        {!loading && trips.length === 0 && (
          <div className="empty-state">
            <span className="empty-icon">🗺️</span>
            <h3>No trips saved yet!</h3>
            <p>Start recording your journeys, photos, and stories in your personal vault.</p>
            <button className="primary-btn" onClick={openCreateForm}>
              Create Your First Trip
            </button>
          </div>
        )}

        {!loading && trips.length > 0 && filteredTrips.length === 0 && (
          <div className="empty-state">
            <span className="empty-icon">🔍</span>
            <h3>No matches found</h3>
            <p>No trips matched your search for "{searchQuery}".</p>
            <button className="secondary-btn" onClick={() => setSearchQuery('')}>
              Clear Filter
            </button>
          </div>
        )}

        {!loading && filteredTrips.length > 0 && (
          <div className="trip-grid">
            {filteredTrips.map(trip => (
              <article className="trip-card" key={trip._id}>
                {/* Trip Cover Image / Card Banner */}
                {trip.coverImage ? (
                  <div
                    className="trip-cover-wrap"
                    onClick={() => {
                      setActiveViewerImage(trip.coverImage)
                      setActiveViewerTitle(`${trip.title} - ${trip.destination}`)
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setActiveViewerImage(trip.coverImage)
                        setActiveViewerTitle(`${trip.title} - ${trip.destination}`)
                      }
                    }}
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
                    <span className="placeholder-icon">✈️</span>
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
                      <span className="rating" title={`${trip.rating} out of 5 stars`}>
                        ★ {trip.rating}/5
                      </span>
                    )}
                  </div>

                  <p className="trip-dates">
                    {formatDate(trip.startDate)} <span>→</span> {formatDate(trip.endDate)}
                  </p>

                  {trip.description && (
                    <p className="trip-description">{trip.description}</p>
                  )}

                  <div className="trip-actions">
                    <button
                      className="primary-btn-outline view-trip-btn"
                      onClick={() => navigate(`/trips/${trip._id}`)}
                      title="View full trip details and photo gallery"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      </svg>
                      <span>View Trip</span>
                    </button>
                    <button
                      className="secondary-btn"
                      onClick={() => openEditForm(trip)}
                      disabled={deletingId === trip._id}
                    >
                      Edit
                    </button>
                    <button
                      className="danger-btn"
                      onClick={() => handleDelete(trip)}
                      disabled={deletingId === trip._id}
                    >
                      {deletingId === trip._id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Quick Image Viewer Modal */}
      <ImageViewerModal
        images={activeViewerImage ? [activeViewerImage] : []}
        title={activeViewerTitle}
        isOpen={Boolean(activeViewerImage)}
        onClose={() => setActiveViewerImage(null)}
      />
    </div>
  )
}

export default Dashboard
