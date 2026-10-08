import React, { createContext, useState, useContext, useEffect } from 'react'
import axios from 'axios'

import { resolvedApiBaseUrl } from '../api'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('token'))

  // Create axios instance with token
  const axiosInstance = axios.create({
    baseURL: resolvedApiBaseUrl
  })

  // Add token to all requests
  axiosInstance.interceptors.request.use((config) => {
    if (config.data instanceof FormData) {
      config.headers.delete('Content-Type')
    }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  })

  // Check if user is logged in on mount
  useEffect(() => {
    if (token) {
      fetchUser()
    } else {
      setLoading(false)
    }
  }, [token])

  const fetchUser = async () => {
    try {
      const response = await axiosInstance.get('/auth/me')
      setUser(response.data.user)
    } catch (error) {
      console.error('Failed to fetch user:', error)
      setToken(null)
      localStorage.removeItem('token')
    } finally {
      setLoading(false)
    }
  }

  const register = async (name, email, password, username) => {
    try {
      const response = await axiosInstance.post('/auth/register', {
        name,
        email,
        password,
        username
      })
      return { success: true, data: response.data }
    } catch (error) {
      const errorMsg = error.response?.data?.message ||
        (!error.response ? 'Unable to connect to server. Ensure backend is running.' : 'Registration failed')
      return {
        success: false,
        error: errorMsg
      }
    }
  }

  const login = async (email, password) => {
    try {
      const response = await axiosInstance.post('/auth/login', {
        email,
        password
      })
      const { token: newToken, user: userData } = response.data
      setToken(newToken)
      setUser(userData)
      localStorage.setItem('token', newToken)
      return { success: true, data: response.data }
    } catch (error) {
      const errorMsg = error.response?.data?.message ||
        (!error.response ? 'Unable to connect to server. Ensure backend is running.' : 'Login failed')
      return {
        success: false,
        error: errorMsg
      }
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
  }

  return (
    <AuthContext.Provider value={{ user, loading, token, register, login, logout, axiosInstance }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
