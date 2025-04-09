import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Try to serve the app on port 5000 first
  // If that's not available, try a different port in the range 5001-5010
  // This serves both the API and the client
  let port = 5000;
  
  const startServer = (tryPort: number) => {
    server.listen({
      port: tryPort,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      log(`serving on port ${tryPort}`);
    }).on('error', (err: any) => {
      if (err.code === 'EADDRINUSE' && tryPort < 5010) {
        // Try the next port if this one is in use
        log(`Port ${tryPort} is in use, trying ${tryPort + 1}`);
        startServer(tryPort + 1);
      } else {
        log(`Failed to start server: ${err.message}`);
        throw err;
      }
    });
  };

  startServer(port);
})();
