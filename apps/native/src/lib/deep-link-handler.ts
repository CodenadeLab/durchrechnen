import { onOpenUrl, getCurrent } from '@tauri-apps/plugin-deep-link'
import { logger } from './logger'

interface DeepLinkHandler {
  initialize: () => Promise<void>
  cleanup: () => void
}

class DeepLinkManager implements DeepLinkHandler {
  private unlistener: (() => void) | null = null

  async initialize(): Promise<void> {
    try {
      // Check for deep links passed when app started
      const currentUrls = await getCurrent()
      if (currentUrls && currentUrls.length > 0) {
        logger.info('Deep link received at startup', { urls: currentUrls });
        for (const url of currentUrls) {
          this.handleDeepLink(url)
        }
      }

      // Listen for deep link events while app is running
      this.unlistener = await onOpenUrl((urls) => {
        logger.info('Deep link received while running', { urls });
        
        for (const url of urls) {
          this.handleDeepLink(url)
        }
      })
      
      logger.info('Deep link handler initialized successfully');
    } catch (error) {
      logger.withError(error as Error).error('Failed to initialize deep link handler');
    }
  }

  private handleDeepLink(url: string): void {
    try {
      const urlObj = new URL(url)
      
      // Handle durchrechnen:// scheme
      if (urlObj.protocol === 'durchrechnen:') {
        // For durchrechnen://dashboard, urlObj.hostname is 'dashboard'
        // For durchrechnen://sign-in?error=..., urlObj.hostname is 'sign-in'
        const path = urlObj.hostname
        const searchParams = urlObj.searchParams
        
        logger.info('Processing deep link', { 
          url, 
          path, 
          hasParams: searchParams.toString().length > 0 
        });
        
        // OAuth callback handling
        if (path === 'dashboard') {
          this.handleOAuthCallback(searchParams)
        } else if (path === 'sign-in') {
          this.handleAuthError(searchParams)
        } else {
          logger.warn('Unknown deep link path', { path, url });
        }
      } else {
        logger.warn('Unsupported deep link protocol', { protocol: urlObj.protocol, url });
      }
    } catch (error) {
      logger.error('Error parsing deep link', { url, error: (error as Error).message });
    }
  }

  private async handleOAuthCallback(searchParams: URLSearchParams): Promise<void> {
    const code = searchParams.get('code')
    const error = searchParams.get('error')
    
    logger.info('Processing OAuth callback', { 
      hasCode: !!code, 
      hasError: !!error,
      errorType: error 
    });
    
    if (error) {
      logger.authEvent('oauth_callback_error', undefined, { error });
      window.location.href = '/sign-in?error=oauth_failed'
      return
    }
    
    if (code) {
      logger.authEvent('oauth_callback_success', undefined, { 
        codeLength: code.length 
      });
      
      try {
        // Verify the session is established
        const apiUrl = import.meta.env.VITE_API_URL
        if (!apiUrl) {
          throw new Error('API URL not configured')
        }
        
        logger.debug('Validating OAuth session', { apiUrl });
        
        const sessionResponse = await fetch(`${apiUrl}/api/session`, {
          credentials: 'include',
        })
        
        logger.httpRequest(
          { method: 'GET', url: `${apiUrl}/api/session` },
          { statusCode: sessionResponse.status }
        );
        
        if (sessionResponse.ok) {
          const data = await sessionResponse.json();
          logger.authEvent('oauth_session_validated', data.user?.id, {
            userEmail: data.user?.email
          });
          // Session is valid, redirect to dashboard
          window.location.href = '/dashboard'
        } else {
          throw new Error(`Session validation failed with status ${sessionResponse.status}`)
        }
      } catch (error) {
        logger.withError(error as Error).error('OAuth session validation failed');
        window.location.href = '/sign-in?error=session_failed'
      }
    } else {
      logger.warn('OAuth callback received without code parameter');
      window.location.href = '/sign-in?error=invalid_callback'
    }
  }

  private handleAuthError(searchParams: URLSearchParams): void {
    const error = searchParams.get('error')
    logger.authEvent('deep_link_auth_error', undefined, { error });
    
    // Navigate to sign-in with error message
    window.location.href = `/sign-in?error=${error || 'unknown_error'}`
  }

  cleanup(): void {
    if (this.unlistener) {
      this.unlistener()
      this.unlistener = null
      logger.debug('Deep link handler cleaned up successfully');
    }
  }
}

// Export singleton instance
export const deepLinkHandler = new DeepLinkManager()

// Initialize deep links when module is imported
let initialized = false

export async function initializeDeepLinks(): Promise<void> {
  if (initialized) {
    logger.debug('Deep links already initialized, skipping');
    return
  }
  
  logger.info('Starting Deep Links initialization');
  initialized = true
  await deepLinkHandler.initialize()
}

// Cleanup function for component unmount
export function cleanupDeepLinks(): void {
  logger.info('Cleaning up Deep Links');
  deepLinkHandler.cleanup()
  initialized = false
}