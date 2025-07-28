/**
 * Get the API server URL based on environment
 */
export function getApiUrl() {
  // Browser environment - Next.js uses process.env in client-side
  if (typeof globalThis !== "undefined" && "window" in globalThis) {
    if (process.env.NODE_ENV === "production") {
      return "https://api.codenade.com";
    }
    return process.env.NEXT_PUBLIC_API_URL || "http://localhost:3003";
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
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:3003";
}

/**
 * Get the Web App URL based on environment
 */
export function getWebUrl() {
  // Browser environment
  if (typeof globalThis !== "undefined" && "window" in globalThis) {
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
 * Get the marketing website URL
 */
export function getWebsiteUrl() {
  // Browser environment
  if (typeof globalThis !== "undefined" && "window" in globalThis) {
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

/**
 * Get Google OAuth Client ID for web platform
 */
export function getGoogleClientId() {
  // Browser environment - Next.js client-side
  if (typeof globalThis !== "undefined" && "window" in globalThis) {
    return (
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
      "956360384452-esnuj8b12b71numekpns9ba9cpcm1n5f.apps.googleusercontent.com"
    );
  }

  // Node.js environment (API server)
  return (
    process.env.GOOGLE_CLIENT_ID ||
    "956360384452-esnuj8b12b71numekpns9ba9cpcm1n5f.apps.googleusercontent.com"
  );
}
