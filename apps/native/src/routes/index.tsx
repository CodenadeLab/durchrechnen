import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    // Check if user is authenticated
    try {
      const apiUrl = import.meta.env.VITE_API_URL
      if (!apiUrl) {
        throw redirect({ to: '/sign-in' })
      }

      const response = await fetch(`${apiUrl}/api/session`, {
        credentials: 'include',
      })

      if (response.ok) {
        // User is authenticated, redirect to dashboard
        throw redirect({ to: '/dashboard' })
      } else {
        // User is not authenticated, redirect to sign-in 
        throw redirect({ to: '/sign-in' })
      }
    } catch (error) {
      // If there's an error or redirect, let it bubble up
      if (error && typeof error === 'object' && 'to' in error) {
        throw error
      }
      
      // For other errors, redirect to sign-in
      throw redirect({ to: '/sign-in' })
    }
  },
  component: () => null, // This component should never render
})