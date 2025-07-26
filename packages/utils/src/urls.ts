/**
 * Get the API server URL based on environment
 */
export function getApiUrl() {
  // Browser environment - use import.meta.env
  if (typeof window !== 'undefined') {
    if (import.meta.env.PROD) {
      return "https://api.codenade.com";
    }
    return import.meta.env.VITE_API_URL || "http://localhost:3003";
  }

  // Node.js environment - use process.env
  if (
    process.env.VERCEL_ENV === "production" ||
    process.env.NODE_ENV === "production"
  ) {
    return "https://api.codenade.com";
  }

  if (process.env.VERCEL_ENV === "preview") {
    return `https://api-${process.env.VERCEL_URL}`;
  }

  // Development
  return process.env.VITE_API_URL || "http://localhost:3003";
}

/**
 * Get the Web App URL based on environment
 */
export function getWebUrl() {
  // Browser environment
  if (typeof window !== 'undefined') {
    if (import.meta.env.PROD) {
      return "https://durchrechnen.codenade.com";
    }
    return "http://localhost:3000";
  }

  // Node.js environment
  if (
    process.env.VERCEL_ENV === "production" ||
    process.env.NODE_ENV === "production"
  ) {
    return "https://durchrechnen.codenade.com";
  }

  if (process.env.VERCEL_ENV === "preview") {
    return `https://${process.env.VERCEL_URL}`;
  }

  // Development
  return "http://localhost:3000";
}

/**
 * Get the Native App URL based on environment (Tauri dev server)
 */
export function getNativeUrl() {
  // Browser environment
  if (typeof window !== 'undefined') {
    if (import.meta.env.PROD) {
      return "durchrechnen://localhost";
    }
    return import.meta.env.VITE_APP_URL || "http://localhost:1420";
  }

  // Node.js environment
  if (
    process.env.VERCEL_ENV === "production" ||
    process.env.NODE_ENV === "production"
  ) {
    // In production, native app uses deep links
    return "durchrechnen://localhost";
  }

  // Development - Tauri dev server
  return process.env.VITE_APP_URL || "http://localhost:1420";
}

/**
 * Get OAuth callback URL for Tauri apps based on environment and platform
 */
export function getOAuthCallbackUrl(platform: 'desktop' | 'mobile' = 'desktop') {
  // Browser environment
  if (typeof window !== 'undefined') {
    if (import.meta.env.PROD) {
      if (platform === 'mobile') {
        return "durchrechnen://oauth-callback";
      }
      return "https://durchrechnen.codenade.com/auth-success";
    }
    
    if (platform === 'mobile') {
      return "durchrechnen://oauth-callback";
    }
    return `${getNativeUrl()}/auth-success`;
  }

  // Node.js environment
  if (
    process.env.VERCEL_ENV === "production" ||
    process.env.NODE_ENV === "production"
  ) {
    if (platform === 'mobile') {
      return "durchrechnen://oauth-callback";
    }
    // Desktop production: external auth success page mit deep link
    return "https://durchrechnen.codenade.com/auth-success";
  }

  if (platform === 'mobile') {
    return "durchrechnen://oauth-callback";
  }

  // Desktop development: direkt zur Tauri app
  return `${getNativeUrl()}/auth-success`;
}

/**
 * Get deep link URL for the app
 */
export function getDeepLinkUrl(path: string = "") {
  return `durchrechnen://${path}`;
}

/**
 * Get the marketing website URL
 */
export function getWebsiteUrl() {
  // Browser environment
  if (typeof window !== 'undefined') {
    if (import.meta.env.PROD) {
      return "https://codenade.com";
    }
    return "http://localhost:3000";
  }

  // Node.js environment
  if (
    process.env.VERCEL_ENV === "production" ||
    process.env.NODE_ENV === "production"
  ) {
    return "https://codenade.com";
  }

  if (process.env.VERCEL_ENV === "preview") {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}