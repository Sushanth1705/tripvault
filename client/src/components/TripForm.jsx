import React, { useEffect, useState } from 'react'

const emptyTrip = {
  title: '',
  destination: '',
  startDate: '',
  endDate: '',
  description: '',
  rating: ''
}

const toDateInput = (value) => value ? new Date(value).toISOString().slice(0, 10) : ''

const TripForm = ({ trip, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState(emptyTrip)
  const [error, setError] = useState('')

  useEffect(() => {
    setFormData(trip ? {
      title: trip.title || '',
      destination: trip.destination || '',
      startDate: toDateInput(trip.startDate),
      endDate: toDateInput(trip.endDate),
      description: trip.description || '',
      rating: trip.rating ?? ''
    } : emptyTrip)
    setError('')
  }, [trip])

  const handleChange = (event) => {
    setFormData(prev => ({ ...prev, [event.target.name]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!formData.title.trim() || !formData.destination.trim()) {
      setError('Title and destination are required')
      return
    }

    if (formData.rating !== '' && (Number(formData.rating) < 1 || Number(formData.rating) > 5)) {
      setError('Rating must be between 1 and 5')
      return
    }

    if (formData.startDate && formData.endDate && formData.endDate < formData.startDate) {
      setError('End date cannot be before start date')
      return
    }

    const submitted = await onSubmit({
      ...formData,
      rating: formData.rating === '' ? undefined : Number(formData.rating)
    })

    if (submitted) {
      setFormData(emptyTrip)
    }
  }

  return (
    <div className="trip-form-panel">
      <div className="form-heading">
        <div>
          <p className="eyebrow">{trip ? 'Update your journey' : 'Add a new memory'}</p>
          <h2>{trip ? 'Edit trip' : 'Create trip'}</h2>
        </div>
        <button type="button" className="icon-btn" onClick={onCancel} aria-label="Close form">×</button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input id="title" name="title" type="text" value={formData.title} onChange={handleChange} disabled={loading} placeholder="Goa beach vacation" />
          </div>
          <div className="form-group">
            <label htmlFor="destination">Destination *</label>
            <input id="destination" name="destination" type="text" value={formData.destination} onChange={handleChange} disabled={loading} placeholder="Goa, India" />
          </div>
          <div className="form-group">
            <label htmlFor="startDate">Start date</label>
            <input id="startDate" name="startDate" type="date" value={formData.startDate} onChange={handleChange} disabled={loading} />
          </div>
          <div className="form-group">
            <label htmlFor="endDate">End date</label>
            <input id="endDate" name="endDate" type="date" value={formData.endDate} onChange={handleChange} disabled={loading} />
          </div>
          <div className="form-group">
            <label htmlFor="rating">Rating</label>
            <select id="rating" name="rating" value={formData.rating} onChange={handleChange} disabled={loading}>
              <option value="">No rating</option>
              {[1, 2, 3, 4, 5].map(value => <option key={value} value={value}>{value} / 5</option>)}
            </select>
          </div>
          <div className="form-group form-group-wide">
            <label htmlFor="description">Description</label>
            <textarea id="description" name="description" value={formData.description} onChange={handleChange} disabled={loading} rows="3" placeholder="What made this trip memorable?" />
          </div>
        </div>
        <div className="form-actions">
          <button type="button" className="secondary-btn" onClick={onCancel} disabled={loading}>Cancel</button>
          <button type="submit" className="primary-btn" disabled={loading}>{loading ? (trip ? 'Updating...' : 'Creating...') : (trip ? 'Update trip' : 'Save trip')}</button>
        </div>
      </form>
    </div>
  )
}

export default TripForm
