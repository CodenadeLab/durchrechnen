import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { logger } from "../lib/logger";
import { getApiUrl } from "@durchrechnen/utils";

export const Route = createFileRoute("/auth-success")({
  component: AuthSuccessPage,
});

function AuthSuccessPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Parse OAuth callback parameters
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const error = urlParams.get('error');
    
    logger.info('Auth success page loaded', { code: !!code, state: !!state, error });
    
    if (error) {
      logger.error('OAuth error', { error });
      navigate({ to: '/sign-in', search: { error } });
      return;
    }
    
    // Check if session already exists (Development mode)
    const checkSession = async () => {
      try {
        const response = await fetch(`${getApiUrl()}/api/session`, {
          credentials: 'include'
        });
        
        if (response.ok) {
          const session = await response.json();
          if (session?.user) {
            logger.info('Session already exists, navigating to dashboard', { user: session.user.email });
            navigate({ to: '/dashboard' });
            return;
          }
        }
        
        // No session exists
        if (code) {
          logger.info('Exchanging code for session');
          
          // Exchange code for session
          const authResponse = await fetch(`${getApiUrl()}/api/auth/callback/google?` + urlParams.toString(), {
            credentials: 'include'
          });
          
          if (authResponse.ok) {
            logger.info('Session created, navigating to dashboard');
            navigate({ to: '/dashboard' });
          } else {
            throw new Error('Failed to exchange code');
          }
        } else {
          logger.warn('No code received and no session exists');
          navigate({ to: '/sign-in' });
        }
      } catch (error) {
        logger.error('Session check or code exchange failed', { error });
        navigate({ to: '/sign-in', search: { error: 'auth_failed' } });
      }
    };
    
    checkSession();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Anmeldung läuft...</h1>
        <p className="text-gray-400">Du wirst gleich weitergeleitet.</p>
      </div>
    </div>
  );
}