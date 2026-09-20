import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import type { VercelRequest, VercelResponse } from '@vercel/node';
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
            let body: unknown = undefined;
            if (req.method === 'POST') {
              const buffers: Uint8Array[] = [];
              for await (const chunk of req) {
                buffers.push(chunk as Uint8Array);
              }
              const str = Buffer.concat(buffers).toString('utf-8');
              try {
                body = JSON.parse(str);
              } catch {
                body = str;
              }
            }

            const vReq = req as unknown as VercelRequest;
            vReq.body = body;

            const vRes = res as unknown as VercelResponse;
            vRes.status = (statusCode: number) => {
              res.statusCode = statusCode;
              return vRes;
            };
            vRes.json = (data: unknown) => {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(data));
            };
            vRes.send = (data: unknown) => {
              if (typeof data === 'string') {
                res.end(data);
              } else {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(data));
              }
            };

            await handler(vReq, vRes);
            return;
          } catch (err) {
            console.error('Error handling API request in Vite dev server:', err);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Internal Server Error' }));
            return;
          }
        }

        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), localPersistencePlugin()],
  server: {
    port: 3000,
    host: true,
  },
});
