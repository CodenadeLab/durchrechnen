// =============================================================================
// REST API ROUTERS - OpenAPI/Swagger Documentation
// =============================================================================

import { OpenAPIHono } from "@hono/zod-openapi";
import type { Context } from "../types";
import { OAuthSuccess } from "../../components/oauth-success";

// Create main REST router
export const routers = new OpenAPIHono<Context>();

// Health check endpoint
routers.get("/api/status", (c) => {
  return c.json({ 
    status: "ok", 
    service: "Durchrechnen API",
    timestamp: new Date().toISOString()
  });
});

// OAuth success page for native app
routers.get("/oauth/success", (c) => {
  return c.html(OAuthSuccess());
});

// OAuth redirect handler für Native App (Tauri)
// Diese Route wird NUR für Tauri genutzt, nicht für Web!
routers.get("/oauth/tauri-redirect", (c) => {
  const code = c.req.query('code');
  const state = c.req.query('state');
  
  if (!code) {
    return c.html(`
      <html>
        <body style="background: #000; color: #fff; display: flex; align-items: center; justify-content: center; min-height: 100vh; font-family: system-ui;">
          <div style="text-align: center;">
            <h1>Fehler bei der Anmeldung</h1>
            <p>Kein Autorisierungscode erhalten.</p>
          </div>
        </body>
      </html>
    `);
  }
  
  // Create deep link with code
  const deepLink = `durchrechnen://oauth-callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state || '')}`;
  
  return c.html(`
    <html>
      <head>
        <title>Anmeldung erfolgreich</title>
        <meta http-equiv="refresh" content="0;url=${deepLink}">
      </head>
      <body style="background: #000; color: #fff; display: flex; align-items: center; justify-content: center; min-height: 100vh; font-family: system-ui;">
        <div style="text-align: center;">
          <h1>Erfolgreich angemeldet!</h1>
          <p>Du wirst zur App weitergeleitet...</p>
          <p style="margin-top: 20px; opacity: 0.7;">Falls die Weiterleitung nicht funktioniert:</p>
          <a href="${deepLink}" style="color: #4a90e2; text-decoration: none;">Klicke hier um zur App zurückzukehren</a>
        </div>
        <script>
          window.location.href = '${deepLink}';
        </script>
      </body>
    </html>
  `);
});