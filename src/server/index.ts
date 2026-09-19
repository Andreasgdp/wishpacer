import { serve } from "bun";
import fs from "node:fs";
import path from "node:path";
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
      return handler(req);
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
