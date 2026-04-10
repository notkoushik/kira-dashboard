import pino from 'pino';
import { config } from './env';

const isDev = config.nodeEnv === 'development';

export const logger = pino(
  {
    level: config.logLevel,
    base: {
      service: 'kira-backend',
      environment: config.nodeEnv,
    },
  },
  isDev
    ? pino.transport({
        target: 'pino-pretty',
        options: {
          colorize: true,
          translate: {
            time: 'SYS_TIME',
          },
        },
      })
    : undefined
);

export function createRequestLogger() {
  return (req: any, res: any, next: any) => {
    const start = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - start;
      logger.info(
        {
          method: req.method,
          url: req.url,
          status: res.statusCode,
          duration: `${duration}ms`,
          userId: req.userId || 'anonymous',
        },
        `${req.method} ${req.url}`
      );
    });

    next();
  };
}
