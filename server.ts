import express from 'express';
import http from 'http';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import { createServer as createViteServer } from 'vite';
import authRouter from './src/server/routes/auth';
import startupsRouter from './src/server/routes/startups';
import eventsRouter from './src/server/routes/events';
import offersRouter from './src/server/routes/offers';
import dealsRouter from './src/server/routes/deals';
import notificationsRouter from './src/server/routes/notifications';
import negotiationsRouter from './src/server/routes/negotiations';
import { setupSwagger } from './src/server/swagger';
import { setupSocketIO } from './src/server/socket';

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const PORT = 3000;

  app.use(cors());
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(express.json());

  // Swagger Documentation
  setupSwagger(app);

  // Real-time Socket.io
  setupSocketIO(server);

  // API Route Registration
  app.use('/api/auth', authRouter);
  app.use('/api/startups', startupsRouter);
  app.use('/api/events', eventsRouter);
  app.use('/api/offers', offersRouter);
  app.use('/api/deals', dealsRouter);
  app.use('/api/notifications', notificationsRouter);
  app.use('/api/negotiations', negotiationsRouter);

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'VentureFlow API', timestamp: new Date().toISOString() });
  });

  // Vite middleware for dev / static serving for prod
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[VentureFlow Server] Listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[VentureFlow Server] Fatal startup error:', err);
});
