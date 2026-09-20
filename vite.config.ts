import { defineConfig, type Plugin, type ViteDevServer, type PreviewServer } from 'vite';
import react from '@vitejs/plugin-react';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import planHandler from './api/plan';
import userDeleteHandler from './api/user/delete';

function localPersistencePlugin(): Plugin {
  const setupApiMiddleware = (server: ViteDevServer | PreviewServer) => {
    server.middlewares.use(async (req, res, next) => {
      if (!req.url?.startsWith('/api/')) {
        return next();
      }

      const vReq = req as unknown as VercelRequest;
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

          vReq.body = body;
          await planHandler(vReq, vRes);
          return;
        } catch (err) {
          console.error('Error handling /api/plan in Vite server:', err);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: 'Internal Server Error' }));
          return;
        }
      }

      if (req.url === '/api/user/delete') {
        try {
          await userDeleteHandler(vReq, vRes);
          return;
        } catch (err) {
          console.error('Error handling /api/user/delete in Vite server:', err);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: 'Internal Server Error' }));
          return;
        }
      }

      next();
    });
  };

  return {
    name: 'local-persistence-api',
    configureServer: setupApiMiddleware,
    configurePreviewServer: setupApiMiddleware,
  };
}

export default defineConfig({
  plugins: [react(), localPersistencePlugin()],
  server: {
    port: 3000,
    host: true,
    watch: {
      ignored: ['**/data/**'],
    },
  },
  preview: {
    port: 3000,
    host: true,
  },
});
