import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import * as Sentry from '@sentry/node';

// Config
import { config, validateConfig } from './config/env';
import { logger, createRequestLogger } from './config/logger';
import { checkDatabaseConnection } from './config/database';

// Middleware
import { apiLimiter } from './middleware/rateLimiter';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { sanitizeRequestBody } from './middleware/validation';

// Routes
import authRoutes from './routes/auth';
import jobsRoutes from './routes/jobs';
import hrContactsRoutes from './routes/hrcontacts';
import logsRoutes from './routes/logs';
import queueRoutes from './routes/queue';
import plannerRoutes from './routes/planner';

let app: Express;

/**
 * Initialize Express app
 */
async function initializeApp(): Promise<Express> {
  try {
    // Validate environment
    validateConfig();

    // Initialize Sentry
    if (config.sentry.dsn) {
      Sentry.init({
        dsn: config.sentry.dsn,
        environment: config.sentry.environment,
        tracesSampleRate: 1.0,
      });
    }

    // Create Express app
    app = express();

    // Security middleware
    app.use(helmet());
    app.use(cors({
      origin: config.frontendUrl,
      credentials: true,
    }));

    // Sentry middleware
    if (config.sentry.dsn) {
      app.use(Sentry.Handlers.requestHandler());
    }

    // Logging request ID
    app.use((_req, _res, next) => {
      (_req as any).id = Math.random().toString(36).substring(7);
      next();
    });

    // Request logging
    app.use(createRequestLogger());

    // Body parsing
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ limit: '10mb', extended: true }));

    // Sanitization
    app.use(sanitizeRequestBody);

    // Rate limiting
    app.use('/api/', apiLimiter);

    // Health check (before auth)
    app.get('/health', (_req, res) => {
      res.status(200).json({
        success: true,
        message: 'KIRA Backend is running',
        environment: config.nodeEnv,
        timestamp: new Date().toISOString(),
      });
    });

    // API Routes
    app.use('/api/v1/auth', authRoutes);
    app.use('/api/v1/jobs', jobsRoutes);
    app.use('/api/v1/hrcontacts', hrContactsRoutes);
    app.use('/api/v1/logs', logsRoutes);
    app.use('/api/v1/queue', queueRoutes);
    app.use('/api/v1/planner', plannerRoutes);

    // 404 handler
    app.use(notFoundHandler);

    // Sentry error handler (must be last)
    if (config.sentry.dsn) {
      app.use(Sentry.Handlers.errorHandler());
    }

    // Global error handler (must be last)
    app.use(errorHandler);

    logger.info('App initialized successfully');
    return app;
  } catch (error) {
    logger.error({ error }, 'Failed to initialize app');
    throw error;
  }
}

/**
 * Start server
 */
async function start(): Promise<void> {
  try {
    // Initialize app
    app = await initializeApp();

    // Check database connection
    const dbOk = await checkDatabaseConnection();
    if (!dbOk) {
      throw new Error('Database connection failed');
    }

    // Start server
    app.listen(config.apiPort, () => {
      logger.info(
        {
          port: config.apiPort,
          environment: config.nodeEnv,
          frontendUrl: config.frontendUrl,
        },
        `🚀 KIRA Backend running on port ${config.apiPort}`
      );
    });
  } catch (error) {
    logger.error({ error }, 'Failed to start server');
    process.exit(1);
  }
}

// Start if not imported as module
if (require.main === module) {
  start();
}

export { app };
