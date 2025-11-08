import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// request logger for /api
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined;

  const originalResJson = res.json.bind(res);
  // @ts-expect-error - extend res.json
  res.json = (bodyJson: any, ...args: any[]) => {
    capturedJsonResponse = bodyJson;
    return originalResJson(bodyJson, ...args);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let line = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        try {
          line += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        } catch {
          /* ignore stringify errors */
        }
      }
      if (line.length > 80) line = line.slice(0, 79) + "…";
      log(line);
    }
  });

  next();
});

(async () => {
  // Your routes should return an http.Server (common pattern)
  const server = await registerRoutes(app);

  // centralized error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err?.status || err?.statusCode || 500;
    const message = err?.message || "Internal Server Error";
    res.status(status).json({ message });
    // still surface in logs
    log(`[error] ${status} ${message}`);
  });

  // dev vs prod client serving
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ---- Listen (fixed) ----
  // Default to localhost to avoid ENOTSUP in sandboxes.
  // You can override with HOST=0.0.0.0 when running locally/Docker.
  const port = Number(process.env.PORT || 5000);
  const host = process.env.HOST || "127.0.0.1";

  // Robust error logging
  server.on("error", (e: any) => {
    if (e?.code === "EADDRINUSE") {
      log(`[fatal] Port ${port} is already in use`);
    } else if (e?.code === "EACCES") {
      log(`[fatal] Permission denied on port ${port}`);
    } else if (e?.code === "ENOTSUP") {
      log(
        `[fatal] ENOTSUP: Your environment does not support binding to '${host}:${port}'. ` +
        `Try HOST=127.0.0.1 or run outside the Agent sandbox.`
      );
    } else {
      log(`[fatal] Server listen error: ${e?.message || e}`);
    }
    process.exit(1);
  });

  // Use (port, host) form — no reusePort/options object.
  server.listen(port, host, () => {
    log(`serving on http://${host}:${port} (NODE_ENV=${app.get("env")})`);
  });
})();
