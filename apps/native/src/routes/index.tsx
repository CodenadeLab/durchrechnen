import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    // Redirect to sign-in first - let user authenticate
    throw redirect({ to: '/sign-in' })
  },
  component: () => null,
})