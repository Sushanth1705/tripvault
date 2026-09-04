import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function TripDetail() {
  const { id } = useParams()
  const { axiosInstance } = useAuth()
  const [trip, setTrip] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => { axiosInstance.get(`/trips/${id}`).then(response => setTrip(response.data.trip)).catch(() => setError('Trip details are unavailable')) }, [id])
  if (error) return <main className="public-page"><p className="error-message">{error}</p></main>
  if (!trip) return <main className="public-page"><p>Loading trip...</p></main>
  return <main className="public-page"><Link to="/dashboard" className="back-link">← Dashboard</Link><h1>{trip.title}</h1>
    <p className="destination">📍 {trip.destination}</p>{trip.description && <p className="profile-bio">{trip.description}</p>}
    <div className="photo-grid">{[trip.coverImage, ...(trip.photos || []).filter(photo => photo !== trip.coverImage)].filter(Boolean).map(photo => <img src={photo} alt={trip.title} key={photo} />)}</div>
  </main>
}
