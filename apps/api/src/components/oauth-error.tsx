import type { FC } from 'hono/jsx'

interface OAuthErrorProps {
  errorMessage?: string
}

export const OAuthError: FC<OAuthErrorProps> = ({ errorMessage = "Bei der Anmeldung ist ein Fehler aufgetreten." }) => {
  return (
    <html>
      <head>
        <title>Anmeldung fehlgeschlagen</title>
        <style dangerouslySetInnerHTML={{
          __html: `
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: linear-gradient(135deg, #ff6b6b 0%, #c44569 100%);
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
            .error-icon {
              width: 80px;
              height: 80px;
              border-radius: 50%;
              background: #ff4757;
              margin: 0 auto 2rem;
              display: flex;
              align-items: center;
              justify-content: center;
              animation: scaleIn 0.5s ease-out;
            }
            .error-icon::after {
              content: '✗';
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
            .retry-link {
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
            .retry-link:hover {
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
          `
        }} />
      </head>
      <body>
        <div className="container">
          <div className="error-icon"></div>
          <h1>Anmeldung fehlgeschlagen</h1>
          <p>{errorMessage}</p>
          
          <a href="durchrechnen://sign-in" className="retry-link">
            Erneut versuchen
          </a>
          
          <div className="close-info">
            Du kannst dieses Fenster jetzt schließen.
          </div>
        </div>

        <script dangerouslySetInnerHTML={{
          __html: `
            // Auto-close after 10 seconds
            setTimeout(() => {
              window.close();
            }, 10000);
          `
        }} />
      </body>
    </html>
  )
}