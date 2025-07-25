'use client'

import { useEffect, useState } from 'react'
import { authClient } from '@/lib/auth-client'

interface User {
  id: string
  name: string
  email: string
  role: string
  isActive: boolean
}

export function DashboardClient() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/session`, {
          credentials: 'include',
        })
        
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        }
      } catch (error) {
        console.error('Failed to fetch session:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSession()
  }, [])

  const handleSignOut = async () => {
    console.log('🚪 Starting sign out process...')
    
    try {
      console.log('📤 Calling authClient.signOut()...')
      const result = await authClient.signOut()
      console.log('✅ authClient.signOut() completed:', result)
      
      console.log('🔄 Redirecting to sign-in...')
      window.location.href = '/sign-in'
    } catch (error) {
      console.error('❌ Sign out failed:', error)
      console.log('🔄 Force redirecting to sign-in anyway...')
      window.location.href = '/sign-in'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Willkommen zurück, {user?.name || 'User'}!
          </h2>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
          >
            Abmelden
          </button>
        </div>
        
        {user && (
          <div className="mt-4 space-y-2">
            <p className="text-sm text-gray-600">
              <span className="font-medium">E-Mail:</span> {user.email}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Rolle:</span> {user.role}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Status:</span> 
              <span className={`ml-1 ${user.isActive ? 'text-green-600' : 'text-red-600'}`}>
                {user.isActive ? 'Aktiv' : 'Inaktiv'}
              </span>
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Preiskalkulation
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            Erstellen Sie neue Preiskalkulationen für Ihre Kunden.
          </p>
          <button className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors">
            Neue Kalkulation
          </button>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Aktuelle Projekte
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            Verwalten Sie Ihre laufenden Kalkulationsprojekte.
          </p>
          <button className="w-full px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors">
            Projekte anzeigen
          </button>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Team Übersicht
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            Sehen Sie die Aktivitäten Ihres Sales-Teams.
          </p>
          <button className="w-full px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 transition-colors">
            Team Dashboard
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Schnellzugriff
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 text-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="text-2xl mb-2">📊</div>
            <div className="text-sm text-gray-600">Berichte</div>
          </button>
          <button className="p-4 text-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="text-2xl mb-2">⚙️</div>
            <div className="text-sm text-gray-600">Einstellungen</div>
          </button>
          <button className="p-4 text-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="text-2xl mb-2">📈</div>
            <div className="text-sm text-gray-600">Statistiken</div>
          </button>
          <button className="p-4 text-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="text-2xl mb-2">💬</div>
            <div className="text-sm text-gray-600">Support</div>
          </button>
        </div>
      </div>
    </div>
  )
}