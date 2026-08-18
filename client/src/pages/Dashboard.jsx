import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Dashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="dashboard-container">
      <h1>🗺️ Welcome to TripVault</h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        Your personal travel memory journal
      </p>

      <div className="user-info">
        <h2 style={{ color: '#667eea', marginBottom: '1rem' }}>User Profile</h2>
        <p><strong>Name:</strong> {user?.name}</p>
        <p><strong>Email:</strong> {user?.email}</p>
      </div>

      <p style={{ color: '#999', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        More features coming in Weeks 2-4!
      </p>

      <button className="logout-btn" onClick={handleLogout}>
        Logout
      </button>
    </div>
  )
}

export default Dashboard
