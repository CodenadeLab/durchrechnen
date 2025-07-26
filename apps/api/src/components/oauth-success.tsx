import type { FC } from "hono/jsx";

export const OAuthSuccess: FC = () => {
  return (
    <html lang="de">
      <head>
        <title>Erfolgreich angemeldet</title>
        <style
          dangerouslySetInnerHTML={{
            __html: `
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              margin: 0;
            }
            .container {
              text-align: center;
              max-width: 400px;
              padding: 2rem;
              background: rgba(255, 255, 255, 0.1);
              backdrop-filter: blur(10px);
              border-radius: 20px;
              border: 1px solid rgba(255, 255, 255, 0.2);
              box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            }
            .checkmark {
              width: 80px;
              height: 80px;
              border-radius: 50%;
              background: #4CAF50;
              margin: 0 auto 2rem;
              display: flex;
              align-items: center;
              justify-content: center;
              animation: scaleIn 0.5s ease-out;
            }
            .checkmark::after {
              content: '✓';
              font-size: 40px;
              color: white;
              font-weight: bold;
            }
            h1 {
              font-size: 2rem;
              margin-bottom: 1rem;
              font-weight: 600;
            }
            p {
              font-size: 1.1rem;
              line-height: 1.6;
              margin-bottom: 2rem;
              opacity: 0.9;
            }
            .app-link {
              display: inline-block;
              padding: 12px 24px;
              background: rgba(255, 255, 255, 0.2);
              border: 2px solid rgba(255, 255, 255, 0.3);
              border-radius: 12px;
              color: white;
              text-decoration: none;
              font-weight: 500;
              transition: all 0.3s ease;
            }
            .app-link:hover {
              background: rgba(255, 255, 255, 0.3);
              border-color: rgba(255, 255, 255, 0.5);
              transform: translateY(-2px);
            }
            .close-info {
              margin-top: 2rem;
              font-size: 0.9rem;
              opacity: 0.7;
            }
            @keyframes scaleIn {
              0% {
                transform: scale(0);
                opacity: 0;
              }
              100% {
                transform: scale(1);
                opacity: 1;
              }
            }
          `,
          }}
        />
      </head>
      <body>
        <div className="container">
          <div className="checkmark"></div>
          <h1>Erfolgreich angemeldet!</h1>
          <p>
            Du wurdest erfolgreich in deinem Durchrechnen-Account angemeldet.
          </p>

          <a href="durchrechnen://dashboard" className="app-link">
            Zurück zur App
          </a>

          <div className="close-info">
            Du kannst dieses Fenster jetzt schließen.
          </div>
        </div>

        <script
          dangerouslySetInnerHTML={{
            __html: `
            // Get authorization code from URL params and pass it via deep link
            const urlParams = new URLSearchParams(window.location.search);
            const code = urlParams.get('code');
            const state = urlParams.get('state');
            
            let deepLink = 'durchrechnen:///api/auth/callback/google';
            if (code) {
              deepLink += '?code=' + encodeURIComponent(code);
              if (state) {
                deepLink += '&state=' + encodeURIComponent(state);
              }
            }
            
            console.log('Authorization code found:', !!code);
            console.log('URL params:', window.location.search);
            console.log('Triggering deep link:', deepLink);
            
            // Try immediate redirect
            window.location.href = deepLink;
            
            // Auto-redirect after 3 seconds as fallback
            setTimeout(() => {
              window.location.href = deepLink;
            }, 3000);
          `,
          }}
        />
      </body>
    </html>
  );
};
