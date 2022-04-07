/* eslint-disable no-process-env */

export default class Envs {
    public static LOG_LEVEL: string = (
        process.env.LOG_LEVEL || 'debug'
    ).toLowerCase();

    public static MOST_WANTED_API_URL: string =
        process.env.MOST_WANTED_API_URL || 'https://api.fbi.gov/wanted/v1/';

    public static HTTP_PORT: number = parseInt(process.env.HTTP_PORT || '3000');

	public static GEO_API_URL: string = process.env.GEO_API_URL || 'https://geo.ipify.org/api/v2/country';
	public static GEO_API_KEY: string = process.env.GEO_API_KEY || 'at_FUOSO0myb4pMSBXK2VIyODTJ915MS';

    public static CACHE_HOST: string = process.env.CACHE_HOST || '127.0.0.1';
    public static CACHE_PORT: number = parseInt(process.env.CACHE_PORT || '6379');
	public static CACHE_PASSWORD: string = process.env.CACHE_PASSWORD || 'password'; // should be secret
    public static CACHE_TTL: number = parseInt(process.env.CACHE_TTL || '86400'); 
}
