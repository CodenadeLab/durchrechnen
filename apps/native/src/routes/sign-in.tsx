import { CanvasRevealEffect } from "@durchrechnen/ui/components/canvas-reveal-effect";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useState } from "react";
import { requireGuest } from "../lib/auth-guards";
import { logger } from "../lib/logger";

export const Route = createFileRoute("/sign-in")({
  beforeLoad: async () => {
    await requireGuest()
  },
  component: SignInPage,
});

function SignInPage() {
  const [initialCanvasVisible, setInitialCanvasVisible] = useState(true);
  const [reverseCanvasVisible, setReverseCanvasVisible] = useState(false);

  const handleGoogleSignIn = async () => {
    logger.info('Google sign-in initiated');
    
    // Show reverse animation on click
    setReverseCanvasVisible(true);
    setTimeout(() => {
      setInitialCanvasVisible(false);
    }, 50);

    // Get Google OAuth URL and open in browser after animation
    setTimeout(async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        logger.debug('Using API URL', { apiUrl });
        
        if (!apiUrl) {
          logger.error('VITE_API_URL is not configured');
          return;
        }

        // Use Deep Link URLs for Tauri (works in dev and production with proper config)
        const callbackURL = "durchrechnen://dashboard"
        const errorCallbackURL = "durchrechnen://sign-in?error=auth_failed"
        
        logger.info('Preparing OAuth request', { 
          callbackURL, 
          errorCallbackURL,
          provider: 'google'
        });

        const response = await fetch(`${apiUrl}/api/auth/sign-in/social`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            provider: "google",
            callbackURL,
            errorCallbackURL,
          }),
        });

        logger.httpRequest(
          { method: 'POST', url: `${apiUrl}/api/auth/sign-in/social` },
          { statusCode: response.status },
        );

        if (response.ok) {
          const data = await response.json();
          logger.info('OAuth response received', { hasUrl: !!data.url });
          
          if (data.url) {
            logger.info('Opening OAuth URL in external browser', { url: data.url });
            // Open OAuth URL in external browser
            const { openUrl } = await import('@tauri-apps/plugin-opener');
            await openUrl(data.url);
            logger.info('OAuth URL opened successfully');
          } else {
            logger.error('No URL in OAuth response', { data });
          }
        } else {
          const errorText = await response.text();
          logger.httpError(
            { method: 'POST', url: `${apiUrl}/api/auth/sign-in/social` },
            new Error(`OAuth request failed: ${errorText}`),
            response.status
          );
        }
      } catch (error) {
        logger.withError(error as Error).error('Error during Google sign-in');
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
