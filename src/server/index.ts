import { serve } from "bun";
import fs from "node:fs";
import path from "node:path";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import handler from "../../api/plan";

const port = Number(process.env.PORT) || 3000;
const distDir = path.resolve(process.cwd(), "dist");

console.log(`Starting Saving Plan server on http://localhost:${port}`);

serve({
  port,
  async fetch(req: Request) {
    const url = new URL(req.url);

    // API endpoints
    if (url.pathname === "/api/plan") {
      let body: unknown = undefined;
      if (req.method === "POST") {
        try {
          body = await req.json();
        } catch {
          body = undefined;
        }
      }

      const headersObj: Record<string, string> = {};
      req.headers.forEach((val, key) => {
        headersObj[key] = val;
      });

      const vReq = {
        method: req.method,
        headers: headersObj,
        body,
      } as unknown as VercelRequest;

      let statusCode = 200;
      let resHeaders: Record<string, string> = {};
      let resBody = "";

      const vRes = {
        status(code: number) {
          statusCode = code;
          return vRes;
        },
        setHeader(key: string, val: string) {
          resHeaders[key] = val;
          return vRes;
        },
        json(data: unknown) {
          resHeaders["Content-Type"] = "application/json";
          resBody = JSON.stringify(data);
          return vRes;
        },
        send(data: unknown) {
          if (typeof data === "string") {
            resBody = data;
          } else {
            resHeaders["Content-Type"] = "application/json";
            resBody = JSON.stringify(data);
          }
          return vRes;
        },
      } as unknown as VercelResponse;

      await handler(vReq, vRes);

      return new Response(resBody, {
        status: statusCode,
        headers: resHeaders,
      });
    }

    // Serve static frontend files if built
    if (fs.existsSync(distDir)) {
      let filePath = path.join(distDir, url.pathname === "/" ? "index.html" : url.pathname);
      if (!fs.existsSync(filePath)) {
        filePath = path.join(distDir, "index.html");
      }
      const file = Bun.file(filePath);
      return new Response(file);
    }

    return new Response(
      "Frontend not built yet. Run `bun run dev` for development or `bun run build` before starting production server.",
      { status: 200, headers: { "Content-Type": "text/plain" } }
    );
  },
});
