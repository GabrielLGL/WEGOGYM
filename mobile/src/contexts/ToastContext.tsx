import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { Toast } from '../components/Toast'
import type { ToastConfig } from '../components/Toast'

interface ToastContextValue {
  showToast: (config: ToastConfig) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<ToastConfig | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const dismiss = useCallback(() => setConfig(null), [])

  const showToast = useCallback((newConfig: ToastConfig) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setConfig(newConfig)
    const duration = newConfig.duration ?? 2500
    timerRef.current = setTimeout(dismiss, duration + 600)
  }, [dismiss])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {config && <Toast config={config} onDismiss={dismiss} />}
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
