import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import axios from 'axios'

export default function Profile() {
  const { username } = useParams()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => { axios.get(`/api/users/${username}/profile`).then(response => setData(response.data)).catch(() => setError('Profile not found')) }, [username])
  if (error) return <main className="public-page"><p className="error-message">{error}</p></main>
  if (!data) return <main className="public-page"><p>Loading profile...</p></main>
  return <main className="public-page"><Link to="/" className="back-link">← TripVault</Link>
    <p className="eyebrow">Traveller profile</p><h1>{data.user.name}</h1><p className="profile-username">@{data.user.username}</p>
    {data.user.bio && <p className="profile-bio">{data.user.bio}</p>}
    <div className="trip-grid">{data.trips.map(trip => <article className="trip-card profile-card" key={trip._id}>
      {trip.coverImage && <img className="trip-cover" src={trip.coverImage} alt="" />}<h3>{trip.title}</h3><p className="destination">📍 {trip.destination}</p>
    </article>)}</div>
  </main>
}
