import fs from 'fs';
import logger from './logger';

export const appendToFileAsync = async (
    path: string,
    data: string
): Promise<void> => {
    return new Promise((resolve, reject) => {
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        fs.appendFile(path, data, (err) => {
            if (err) {
                reject(err);
            } else {
                logger.debug(`Written to file ${path}... `);
                resolve();
            }
        });
    });
};
