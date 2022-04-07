import { Router, Response } from 'express';
import { CreateWitnessReport, TypedRequestBody } from '../misc/types';
import { body, validationResult } from 'express-validator';
import { MostWantedService } from '../services/mostWanted';
import { GeoApiService } from '../services/geoApi';
import { appendToFileAsync } from '../misc/utils';
import path from 'path';
import * as libphonenumber from 'google-libphonenumber';
import logger from '../misc/logger';

export const router = Router();
const mostWantedService = new MostWantedService();
const geoApiService = new GeoApiService();
const phoneUtil = new libphonenumber.PhoneNumberUtil();

router.post(
    '/',
    body('title').isString(),
    body('phoneNumber').isString(),
    async (req: TypedRequestBody<CreateWitnessReport>, res: Response) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            // check if the phone number is valid
            const phoneNumber = phoneUtil.parseAndKeepRawInput(
                req.body.phoneNumber
            );

            if (!phoneUtil.isValidNumber(phoneNumber)) {
                return res.status(400).json({ detail: 'Number not valid.' });
            }

            let countryCode = phoneUtil.getRegionCodeForNumber(phoneNumber);
            if (!countryCode) {
                // if country could not be resolved by number, try with ip address
                countryCode = await geoApiService.getCountry(
                    req.socket.remoteAddress
                );
                if (!countryCode) {
                    return res
                        .status(400)
                        .json({ detail: 'Could not resolve calling country.' });
                }
            }
            logger.debug(`Got country code: ${countryCode}`);

            // check if the title exists
            const requestedTitle = req.body.title;
            const title = await mostWantedService.titleExists(requestedTitle);
            if (!title) {
                return res
                    .status(404)
                    .json({ detail: 'The requested title does not exist.' });
            }

            const data = `${title},${phoneNumber.getRawInput()},${countryCode}\n`;
            await appendToFileAsync(
                path.join(__dirname, '../out/out.txt'),
                data
            );

            return res
                .status(201)
                .json({ detail: 'Witness report successfully posted.' });
        } catch (e) {
            const error = e as Error;
            let status = 500;

            if (
                error.message === 'Invalid country calling code' ||
                error.message ===
                    'The string supplied did not seem to be a phone number'
            ) {
                status = 400;
            }

            return res.status(status).json({ detail: error.message });
        }
    }
);
