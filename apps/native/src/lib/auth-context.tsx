import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { initializeDeepLinks, cleanupDeepLinks } from './deep-link-handler'
import { logger } from './logger'

interface User {
  id: string
  name: string
  email: string
  role: string
  isActive: boolean
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
  checkSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const checkSession = async () => {
    logger.debug('Checking user session');
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL
      if (!apiUrl) {
        throw new Error('VITE_API_URL not configured')
      }

      const response = await fetch(`${apiUrl}/api/session`, {
        credentials: 'include',
      })

      logger.httpRequest(
        { method: 'GET', url: `${apiUrl}/api/session` },
        { statusCode: response.status }
      );

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        logger.authEvent('session_validated', data.user?.id, { 
          userEmail: data.user?.email,
          userRole: data.user?.role 
        });
      } else {
        setUser(null)
        logger.authEvent('session_invalid', undefined, { statusCode: response.status });
      }
    } catch (error) {
      logger.error('Session check failed', { error: (error as Error).message });
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    logger.authEvent('sign_out_initiated', user?.id);
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL
      if (apiUrl) {
        const response = await fetch(`${apiUrl}/api/auth/sign-out`, {
          method: 'POST',
          credentials: 'include',
        })
        
        logger.httpRequest(
          { method: 'POST', url: `${apiUrl}/api/auth/sign-out` },
          { statusCode: response.status }
        );
      }
    } catch (error) {
      logger.error('Sign out failed', { error: (error as Error).message });
    } finally {
      setUser(null)
      logger.authEvent('sign_out_completed', user?.id);
      // Redirect to sign-in
      window.location.href = '/sign-in'
    }
  }

  useEffect(() => {
    checkSession()
    
    // Initialize deep links for OAuth callbacks
    logger.info('Initializing Deep Links for OAuth callbacks');
    initializeDeepLinks().catch((error) => {
      logger.error('Failed to initialize Deep Links', { error: (error as Error).message });
    })
    
    // Cleanup on unmount
    return () => {
      logger.debug('Cleaning up Deep Links');
      cleanupDeepLinks()
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, signOut, checkSession }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}