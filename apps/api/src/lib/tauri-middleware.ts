import type { MiddlewareHandler } from "hono";

// Append callbackURL for Tauri clients
export const appendTauriCallbackURL: MiddlewareHandler = async (c, next) => {
  // Only for social sign-in requests
  if (!c.req.path.includes('/sign-in/social')) {
    return next();
  }

  const platform = c.req.header('platform');
  
  if (platform && !['android', 'ios'].includes(platform)) {
    // This is a hack: modify the request body to include our deep link callback
    const originalBody = await c.req.json();
    
    // Override the callbackURL to include deep link parameter
    const modifiedBody = {
      ...originalBody,
      callbackURL: `http://localhost:3003/api/auth/callback/google?callbackURL=durchrechnen:///dashboard`
    };
    
    // Create new request with modified body
    const newRequest = new Request(c.req.raw.url, {
      method: c.req.method,
      headers: c.req.raw.headers,
      body: JSON.stringify(modifiedBody)
    });
    
    // Create new Hono Request from the modified request
    const newHonoRequest = new Request(newRequest.url, {
      method: newRequest.method,
      headers: newRequest.headers,
      body: newRequest.body
    });
    
    // Set the modified request on context
    c.req = newHonoRequest as any;
  }
  
  return next();
};

// Check for deep link callbacks and redirect
export const checkTauriCallback: MiddlewareHandler = async (c, next) => {
  // Only for OAuth callbacks
  if (!c.req.path.includes('/callback/')) {
    return next();
  }

  const callbackURL = c.req.query('callbackURL');
  
  if (callbackURL?.startsWith('durchrechnen://')) {
    // Extract authorization code and state
    const code = c.req.query('code');
    const state = c.req.query('state');
    
    if (code) {
      // Create deep link with authorization code
      const deepLink = `durchrechnen:///api/auth/callback/google?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state || '')}`;
      
      // Return redirect page
      return c.html(`
        <html>
          <head>
            <title>OAuth Erfolg</title>
            <style>
              body { 
                font-family: system-ui; 
                background: #000; 
                color: #fff; 
                display: flex; 
                justify-content: center; 
                align-items: center; 
                min-height: 100vh; 
                margin: 0; 
              }
            </style>
          </head>
          <body>
            <div>
              <h1>Erfolgreich angemeldet!</h1>
              <p>Du wirst zur App weitergeleitet...</p>
            </div>
            <script>
              console.log('Deep link:', '${deepLink}');
              window.location.href = '${deepLink}';
              setTimeout(() => {
                window.location.href = '${deepLink}';
              }, 1000);
            </script>
          </body>
        </html>
      `);
    }
  }
  
  return next();
};