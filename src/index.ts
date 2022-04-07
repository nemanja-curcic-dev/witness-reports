import { Server } from 'http';
import httpApp from './http-app';
import logger from './misc/logger';
import Envs from './misc/envs';

const httpServer: Server = httpApp.listen(Envs.HTTP_PORT, () => {
    logger.info(`HTTP server is listening on port ${Envs.HTTP_PORT}`);
});

const shutdown = (): void => {
    logger.info('SIGTERM/SIGINT received');
    // Shutdown HTTP server
    if (httpServer) {
        httpServer.close((err) => {
            if (err) {
                logger.error('Graceful shutdown', err);
                process.exit(1);
            }

            logger.info('Server stopped');
        });
    }
};

process.on('SIGTERM', shutdown);
