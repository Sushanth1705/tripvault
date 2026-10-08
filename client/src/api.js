import axios from 'axios'

const rawApiUrl = import.meta.env.VITE_API_URL || ''
export const resolvedApiBaseUrl = (rawApiUrl && !rawApiUrl.includes('your-render-service'))
  ? rawApiUrl
  : '/api'

export const api = axios.create({
  baseURL: resolvedApiBaseUrl,
  headers: { 'Content-Type': 'application/json' }
})
