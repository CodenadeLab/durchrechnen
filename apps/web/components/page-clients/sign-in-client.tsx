"use client";

import { CanvasRevealEffect } from "@durchrechnen/ui/components/canvas-reveal-effect";
import { motion } from "motion/react";
import { useState } from "react";

export function SignInClient() {
  const [initialCanvasVisible, setInitialCanvasVisible] = useState(true);
  const [reverseCanvasVisible, setReverseCanvasVisible] = useState(false);

  const handleGoogleSignIn = async () => {
    // Show reverse animation on click
    setReverseCanvasVisible(true);
    setTimeout(() => {
      setInitialCanvasVisible(false);
    }, 50);

    // Get Google OAuth URL from Better-Auth and redirect after animation
    setTimeout(async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/sign-in/social`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            provider: 'google',
            callbackURL: `${window.location.origin}/dashboard`,
            errorCallbackURL: `${window.location.origin}/sign-in?error=auth_failed`
          }),
        });

        if (response.ok) {
          const data = await response.json();
          window.location.href = data.url;
        } else {
          console.error('Failed to get Google OAuth URL');
        }
      } catch (error) {
        console.error('Error during Google sign-in:', error);
      }
    }, 1500);
  };

  return (
    <div className="flex w-full flex-col min-h-screen bg-black relative">
      {/* Canvas Background */}
      <div className="absolute inset-0 z-0">
        {/* Initial canvas (forward animation) */}
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

        {/* Reverse canvas (appears when clicked) */}
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

      {/* Content Layer */}
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
