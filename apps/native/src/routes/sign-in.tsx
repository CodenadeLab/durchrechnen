import { CanvasRevealEffect } from "@durchrechnen/ui/components/canvas-reveal-effect";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { openUrl } from "@tauri-apps/plugin-opener";
import { getCurrent, onOpenUrl } from "@tauri-apps/plugin-deep-link";
import { usePlatform } from "../hooks/use-platform";
import { logger } from "../lib/logger";
import { getApiUrl, getOAuthCallbackUrl } from "@durchrechnen/utils";

export const Route = createFileRoute("/sign-in")({
  component: SignInPage,
});

function SignInPage() {
  const [initialCanvasVisible, setInitialCanvasVisible] = useState(true);
  const [reverseCanvasVisible, setReverseCanvasVisible] = useState(false);
  const navigate = useNavigate();
  const { platform, isDesktop, isMobile } = usePlatform();

  // Debug-Info beim App-Start
  logger.info('App Debug Info', {
    protocol: window.location.protocol,
    href: window.location.href,
    platform: platform,
    userAgent: navigator.userAgent
  });

  // Custom Tauri OAuth Deep Link Handler
  useEffect(() => {

    const handleDeepLink = async (urls: string[] | null) => {
      if (!urls?.length) return;
      const url = urls[0];
      
      logger.info('Deep link received', { url });
      
      // Check if it's an OAuth callback deep link
      if (url.startsWith('durchrechnen://oauth-callback')) {
        logger.info('OAuth callback deep link received', { url });
        
        try {
          // Parse the deep link URL
          const urlObj = new URL(url);
          const code = urlObj.searchParams.get('code');
          const state = urlObj.searchParams.get('state');
          
          if (code) {
            logger.info('Authorization code received, exchanging for session');
            
            // Exchange code for session durch direkten Aufruf des Auth Callbacks
            const response = await fetch(`${getApiUrl()}/api/auth/callback/google`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
              body: JSON.stringify({
                code: code,
                state: state || ''
              })
            });
            
            if (response.ok) {
              logger.info('Token exchange successful');
              
              // Check if session is available
              const sessionResponse = await fetch(`${getApiUrl()}/api/session`, {
                credentials: 'include'
              });
              
              if (sessionResponse.ok) {
                const session = await sessionResponse.json();
                logger.info('Session created successfully', { user: session.user?.email });
                navigate({ to: '/dashboard' });
              } else {
                logger.error('No session after OAuth callback');
                navigate({ to: '/sign-in', search: { error: 'Session not created' } });
              }
            } else {
              logger.error('OAuth callback failed', { status: response.status });
              navigate({ to: '/sign-in', search: { error: 'OAuth failed' } });
            }
          } else {
            logger.error('No code in deep link');
            navigate({ to: '/sign-in', search: { error: 'No authorization code' } });
          }
        } catch (error) {
          logger.error('OAuth processing failed', { error });
          navigate({ to: '/sign-in', search: { error: 'OAuth error' } });
        }
      }
    };

    // Check for initial URL on app start
    getCurrent().then(handleDeepLink);

    // Listen for new deep links
    const unlisten = onOpenUrl(handleDeepLink);

    return () => {
      unlisten.then((f) => f());
    };
  }, [navigate]);

  const handleGoogleSignIn = async () => {
    logger.info('Google OAuth initiated');
    
    // Show reverse animation on click
    setReverseCanvasVisible(true);
    setTimeout(() => {
      setInitialCanvasVisible(false);
    }, 50);

    // OAuth flow after animation
    setTimeout(async () => {
      try {
        logger.info('Starting OAuth flow', { platform, isDesktop, isMobile });
        
        // Development vs Production OAuth Flow (wie im Supabase Beispiel)
        const isDev = import.meta.env.DEV;
        const redirectUrl = isDev 
          ? `${window.location.origin}/auth-success` 
          : getOAuthCallbackUrl(isMobile ? 'mobile' : 'desktop');
        
        logger.info('Getting OAuth URL from Better-Auth', { redirectUrl, platform, isDev });
        
        try {
          // POST Request an Better-Auth für OAuth URL 
          const response = await fetch(`${getApiUrl()}/api/auth/sign-in/social`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              provider: 'google',
              callbackURL: redirectUrl,
              disableRedirect: true // Wichtig: verhindert automatische Weiterleitung
            }),
          });
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          
          if (data?.url) {
            logger.info('Opening OAuth URL', { url: data.url, isDev });
            
            if (isDev) {
              // Development: OAuth im Webview
              window.location.href = data.url;
            } else {
              // Production: OAuth im externen Browser
              await openUrl(data.url);
            }
            
            logger.info('OAuth URL opened successfully');
          } else {
            throw new Error('No OAuth URL received from Better-Auth');
          }
        } catch (error) {
          logger.error('Failed to get/open OAuth URL', { error: (error as Error).message });
        }
        
      } catch (error) {
        logger.error('OAuth failed', { 
          error: (error as Error).message
        });
      }
    }, 1500);
  };

  return (
    <div className="flex w-full flex-col min-h-screen bg-black relative">
      <div className="absolute inset-0 z-0">
        {initialCanvasVisible && (
          <div className="absolute inset-0">
            <CanvasRevealEffect
              animationSpeed={3}
              containerClassName="bg-black"
              colors={[
                [255, 255, 255],
                [255, 255, 255],
              ]}
              dotSize={6}
              reverse={false}
            />
          </div>
        )}

        {reverseCanvasVisible && (
          <div className="absolute inset-0">
            <CanvasRevealEffect
              animationSpeed={4}
              containerClassName="bg-black"
              colors={[
                [255, 255, 255],
                [255, 255, 255],
              ]}
              dotSize={6}
              reverse={true}
            />
          </div>
        )}

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,0,0,1)_0%,_transparent_100%)]" />
        <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-black to-transparent" />
      </div>

      <div className="relative z-10 flex flex-col flex-1">
        <div className="flex flex-1 flex-col justify-center items-center">
          <div className="w-full max-w-sm">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="space-y-6 text-center"
            >
              <div className="space-y-1">
                <h1 className="text-[2.5rem] font-bold leading-[1.1] tracking-tight text-white">
                  Durchrechnen
                </h1>
              </div>

              <div className="space-y-4">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="backdrop-blur-[2px] w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 py-3 px-4 transition-colors"
                >
                  <span className="text-lg">G</span>
                  <span>Mit Google anmelden</span>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
