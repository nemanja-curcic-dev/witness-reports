import axios, { AxiosInstance } from 'axios';
import Envs from '../misc/envs';
import logger from '../misc/logger';

export interface GeoApiData {
    ip: string;
    location: {
        country: string;
        region: string;
        timezone: string;
    };
    as: {
        asn: number;
        name: string;
        route: string;
        domain: string;
        type: string;
    };
    isp: string;
}

export class GeoApiService {
    private axios: AxiosInstance;

    constructor() {
        this.axios = axios.create({
            baseURL: Envs.GEO_API_URL,
            timeout: 5000,
        });
    }

    public getCountry = async (ipAddress?: string): Promise<string | undefined> => {
        logger.debug(
            `Calling getCountry of GeoApiService with ip ${ipAddress}... `
        );

        if (!ipAddress) {
            logger.debug('No ip address provided... ');
            return;
        }

        const response = await this.axios.get('', {
            params: {
                apiKey: Envs.GEO_API_KEY,
                ipAddress: ipAddress,
            },
        });

        const data = response.data as GeoApiData;
        logger.debug(`Got country: ${data.location.country}. `);
        return data.location.country;
    };
}
