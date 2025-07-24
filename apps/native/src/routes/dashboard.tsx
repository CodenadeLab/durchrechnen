import { createFileRoute } from '@tanstack/react-router'
import { useAuth } from '../lib/auth-context'
import { requireAuth } from '../lib/auth-guards'

export const Route = createFileRoute('/dashboard')({
  beforeLoad: async () => {
    await requireAuth()
  },
  component: DashboardPage,
})

function DashboardPage() {
  const { user, signOut } = useAuth()
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              🎉 Dashboard - Native App
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Willkommen, {user?.name || 'User'}!
              </span>
              <button
                onClick={signOut}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                Abmelden
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-blue-900 mb-3">
                OAuth Flow erfolgreich!
              </h2>
              <p className="text-blue-700">
                Du bist erfolgreich über Google OAuth angemeldet.
                Deep Links funktionieren! 🔥
              </p>
            </div>
            
            <div className="bg-green-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-green-900 mb-3">
                Multi-Client Support
              </h2>
              <p className="text-green-700">
                Diese native Tauri App nutzt dieselbe API wie die Web App.
                Perfect für verschiedene Clients!
              </p>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">Debug Info:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• URL: {window.location.href}</li>
              <li>• Host: {window.location.host}</li>
              <li>• Origin: {window.location.origin}</li>
              <li>• Protocol: durchrechnen://</li>
            </ul>
          </div>
          
          {user && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">User Info:</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Name: {user.name}</li>
                <li>• Email: {user.email}</li>
                <li>• Role: {user.role}</li>
                <li>• Status: {user.isActive ? 'Aktiv' : 'Inaktiv'}</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}