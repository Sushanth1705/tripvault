import { createContext, useContext, useMemo, useState } from 'react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const removeToast = (id) => setToasts(current => current.filter(toast => toast.id !== id))

  const showToast = (message, type = 'success') => {
    const id = `${Date.now()}-${Math.random()}`
    setToasts(current => [...current, { id, message, type }])
    window.setTimeout(() => removeToast(id), 4200)
  }

  const value = useMemo(() => ({ showToast }), [])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-region" role="status" aria-live="polite">
        {toasts.map(toast => (
          <div className={`toast toast-${toast.type}`} key={toast.id}>
            <span>{toast.type === 'success' ? 'OK' : '!'}</span>
            <p>{toast.message}</p>
            <button type="button" onClick={() => removeToast(toast.id)} aria-label="Dismiss notification">×</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within ToastProvider')
  return context
}
