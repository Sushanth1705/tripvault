import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import TripForm from '../components/TripForm'

const formatDate = (value) => value
  ? new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
  : 'Date not set'

const getApiError = (error, fallback) => {
  if (!error.response) return 'Unable to reach the server. Check your connection and try again.'
  return error.response.data?.message || fallback
}

const Dashboard = () => {
  const { user, logout, axiosInstance } = useAuth()
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
        setFeedback('Trip updated successfully.')
      } else {
        const { image, ...data } = tripData
        const response = await axiosInstance.post('/trips', data)
        if (image) await uploadPhoto(response.data.trip._id, image)
        setFeedback('Trip created successfully.')
      }

      setFormOpen(false)
      setEditingTrip(null)
      await fetchTrips()
      return true
    } catch (requestError) {
      setError(getApiError(requestError, 'Unable to save this trip.'))
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
      setProfileOpen(false)
      window.localStorage.setItem('profileUser', JSON.stringify(response.data.user))
    } catch (requestError) {
      setError(getApiError(requestError, 'Unable to update your profile.'))
    }
  }

  const handleDelete = async (trip) => {
    if (!window.confirm('Are you sure you want to delete this trip?')) return

    try {
      setDeletingId(trip._id)
      setError('')
      await axiosInstance.delete(`/trips/${trip._id}`)
      setFeedback('Trip deleted successfully.')
      await fetchTrips()
    } catch (requestError) {
      setError(getApiError(requestError, 'Unable to delete this trip.'))
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

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">Your travel memory journal</p>
          <h1>Welcome back, {user?.name}</h1>
          <p className="dashboard-subtitle">Keep the places, stories, and small details worth returning to.</p>
        </div>
        <div className="header-actions"><button className="secondary-btn" onClick={() => navigate(`/profile/${user?.username}`)}>My Profile</button><button className="secondary-btn" onClick={() => setProfileOpen(!profileOpen)}>Edit Profile</button><button className="logout-btn" onClick={handleLogout}>Logout</button></div>
      </header>

      {feedback && <div className="success-message">{feedback}</div>}
      {error && <div className="error-message">{error}</div>}
      {profileOpen && <form className="profile-editor" onSubmit={saveProfile}><label htmlFor="bio">Bio</label><textarea id="bio" value={profileBio} onChange={event => setProfileBio(event.target.value)} maxLength="280" /><button className="primary-btn" type="submit">Save profile</button></form>}

      {!formOpen && (
        <button className="primary-btn create-btn" onClick={openCreateForm}>+ Create Trip</button>
      )}

      {formOpen && (
        <TripForm
          trip={editingTrip}
          onSubmit={handleSave}
          onCancel={() => { setFormOpen(false); setEditingTrip(null) }}
          loading={saving}
        />
      )}

      <section className="trips-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Your collection</p>
            <h2>Trips</h2>
          </div>
          {!loading && <span className="trip-count">{trips.length} {trips.length === 1 ? 'memory' : 'memories'}</span>}
        </div>

        {loading && <p className="state-message">Loading your trips...</p>}

        {!loading && trips.length === 0 && (
          <div className="empty-state">
            <span className="empty-icon">✦</span>
            <h3>No trips yet!</h3>
            <p>Start creating your travel memories by adding your first trip.</p>
            <button className="primary-btn" onClick={openCreateForm}>Create Your First Trip</button>
          </div>
        )}

        {!loading && trips.length > 0 && (
          <div className="trip-grid">
            {trips.map(trip => (
              <article className="trip-card" key={trip._id}>
                {trip.coverImage && <img className="trip-cover" src={trip.coverImage} alt="" />}
                <div className="trip-card-top">
                  <div>
                    <h3>{trip.title}</h3>
                    <p className="destination">📍 {trip.destination}</p>
                  </div>
                  {trip.rating && <span className="rating">★ {trip.rating}/5</span>}
                </div>
                <p className="trip-dates">{formatDate(trip.startDate)} <span>→</span> {formatDate(trip.endDate)}</p>
                {trip.description && <p className="trip-description">{trip.description}</p>}
                <div className="trip-actions">
                  <button className="secondary-btn" onClick={() => navigate(`/trips/${trip._id}`)}>View</button><button className="secondary-btn" onClick={() => openEditForm(trip)} disabled={deletingId === trip._id}>Edit</button>
                  <button className="danger-btn" onClick={() => handleDelete(trip)} disabled={deletingId === trip._id}>{deletingId === trip._id ? 'Deleting...' : 'Delete'}</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default Dashboard
