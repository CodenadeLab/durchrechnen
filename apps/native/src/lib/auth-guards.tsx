import { redirect } from '@tanstack/react-router'
import { ReactNode } from 'react'
import { useAuth } from './auth-context'

// Auth Guard Component for protected routes
export function AuthGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    // Redirect to sign-in if no user
    window.location.href = '/sign-in'
    return null
  }

  return <>{children}</>
}

// Guest Guard for auth routes (sign-in, etc.)
export function GuestGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    )
  }

  if (user) {
    // Redirect to dashboard if already authenticated
    window.location.href = '/dashboard'
    return null
  }

  return <>{children}</>
}

// Utility function for route-level guards
export async function requireAuth(): Promise<void> {
  try {
    const apiUrl = import.meta.env.VITE_API_URL
    if (!apiUrl) {
      throw new Error('API URL not configured')
    }

    const response = await fetch(`${apiUrl}/api/session`, {
      credentials: 'include',
    })

    if (!response.ok) {
      throw redirect({
        to: '/sign-in',
      })
    }
  } catch (error) {
    throw redirect({
      to: '/sign-in',
    })
  }
}

export async function requireGuest(): Promise<void> {
  try {
    const apiUrl = import.meta.env.VITE_API_URL
    if (!apiUrl) {
      return // Allow access if API URL not configured
    }

    const response = await fetch(`${apiUrl}/api/session`, {
      credentials: 'include',
    })

    if (response.ok) {
      throw redirect({
        to: '/dashboard',
      })
    }
  } catch (error) {
    // Allow access if session check fails
    return
  }
}