import winston  from 'winston';
import Envs from './envs';

export default winston.createLogger({
    level: Envs.LOG_LEVEL,
    format: winston.format.json(),
    defaultMeta: { service: 'witness-report-service' },
    transports: [
        new winston.transports.Console
    ],
});