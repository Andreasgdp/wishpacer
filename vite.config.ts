import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import handler from './api/plan';

function localPersistencePlugin(): Plugin {
  return {
    name: 'local-persistence-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) {
          return next();
        }

        if (req.url === '/api/plan') {
          try {
            // Convert Connect req to Web Request
            const protocol = req.headers['x-forwarded-proto'] || 'http';
            const host = req.headers.host || 'localhost:3000';
            const fullUrl = `${protocol}://${host}${req.url}`;

            let body: string | undefined;
            if (req.method === 'POST') {
              const buffers: Uint8Array[] = [];
              for await (const chunk of req) {
                buffers.push(chunk as Uint8Array);
              }
              body = Buffer.concat(buffers).toString('utf-8');
            }

            const headers = new Headers();
            for (const [key, value] of Object.entries(req.headers)) {
              if (value) {
                headers.set(key, Array.isArray(value) ? value.join(', ') : value);
              }
            }

            const webReq = new Request(fullUrl, {
              method: req.method,
              headers,
              body,
            });

            const webRes = await handler(webReq);
            res.statusCode = webRes.status;
            webRes.headers.forEach((val, key) => {
              res.setHeader(key, val);
            });

            const resBody = await webRes.text();
            res.end(resBody);
            return;
          } catch (err) {
            console.error('Error handling API request:', err);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Internal Server Error' }));
            return;
          }
        }

        next();
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), localPersistencePlugin()],
  server: {
    port: 3000,
    host: true,
  }
});
