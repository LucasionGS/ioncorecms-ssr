import fs from 'node:fs/promises'
import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import cors from "cors";
import process from "node:process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { type ViteDevServer } from 'vite'
import ApiController from "./controllers/ApiController.ts";
import MonitoringService from "./services/MonitoringService.ts";
import "./core/NodeRegistry.ts";
import "./core/BlockRegistry.ts";

const app = express();
const httpServer = createServer(app);

// Get directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProduction = process.env.NODE_ENV === 'production';
const base = process.env.BASE || '/';

// Cached production assets
const templateHtml = isProduction
  ? await fs.readFile(path.join(__dirname, '../dist/client/index.html'), 'utf-8')
  : '';

const io = new Server(httpServer, {
  cors: {
    origin: isProduction ? false : (process.env.CLIENT_URL || "http://localhost:5173"),
    methods: ["GET", "POST"]
  }
});

// Export io instance for use in other modules
export { io };

// Initialize monitoring service
const monitoringService = new MonitoringService();

const port = process.env.INTERNAL_PORT || 3174;

// CORS configuration
const corsOptions = {
  origin: isProduction ? false : (process.env.CLIENT_URL || "http://localhost:5173"),
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
};

// Middleware
if (!isProduction) {
  app.use(cors(corsOptions));
}
app.use(express.json({ limit: '100mb' })); // Increase JSON payload limit
app.use(express.urlencoded({ extended: true, limit: '100mb' })); // Increase URL encoded payload limit

// Configure request timeout for the entire app
app.use((req, _res, next) => {
  // Set longer timeout for file upload routes
  if (req.path.includes('/mods') && req.method === 'POST') {
    req.setTimeout(300000); // 5 minutes for file uploads
  }
  next();
});

// Add Vite or respective production middlewares
let vite: ViteDevServer;
if (!isProduction) {
  const { createServer } = await import('vite')
  vite = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
    base,
  })
  app.use(vite.middlewares)
} else {
  const compression = (await import('compression')).default
  const sirv = (await import('sirv')).default
  app.use(compression())
  app.use(base, sirv(path.join(__dirname, '../dist/client'), { extensions: [] }))
}

// Routes
app.use("/api", ApiController.router);

// Serve HTML with SSR
app.use('*all', async (req, res) => {
  try {
    const url = req.originalUrl.replace(base, '')

    let template: string
    let render: typeof import('../src/entry-server.tsx').render
    if (!isProduction) {
      // Always read fresh template in development
      template = await fs.readFile(path.join(__dirname, '../index.html'), 'utf-8')
      template = await vite.transformIndexHtml(url, template)
      render = (await vite.ssrLoadModule('/src/entry-server.tsx')).render
    } else {
      template = templateHtml
      // @ts-ignore Generated file, will work for production
      render = (await import(path.join(__dirname, '../dist/server/entry-server.js'))).render
    }

    const rendered = await render(url)

    const html = template
      .replace(`<!--app-head-->`, rendered.head ?? '')
      .replace(`<!--app-html-->`, rendered.html ?? '')

    res.status(200).set({ 'Content-Type': 'text/html' }).send(html)
  } catch (e: unknown) {
    if (vite && e instanceof Error) {
      vite.ssrFixStacktrace(e)
    }
    console.log(e instanceof Error ? e.stack : String(e))
    res.status(500).end(e instanceof Error ? e.stack : String(e))
  }
})

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Start server
function startServer() {
  try {
    // Start monitoring service
    monitoringService.startCollection();
    
    httpServer.listen(port, () => {
      console.log(`Server is running on port ${port}`);
      console.log(`Socket.IO is ready for connections`);
      console.log(`System monitoring started`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();