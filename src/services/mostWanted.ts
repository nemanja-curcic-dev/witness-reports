import axios, { AxiosInstance } from 'axios';
import Envs from '../misc/envs';
import logger from '../misc/logger';
import * as diff from 'diff-match-patch';
import Redis from 'ioredis';

export class MostWantedService {
    private axios: AxiosInstance;
    private diff: diff.diff_match_patch;
    private cache: Redis;

    constructor() {
        this.axios = axios.create({
            baseURL: Envs.MOST_WANTED_API_URL,
            timeout: 5000,
        });

        this.diff = new diff.diff_match_patch();
        this.cache = this.getCache();
    }

    public titleExists = async (title: string): Promise<string | undefined> => {
        const pageSize = 50;
        let page = 1;
        // remove white spaces and set all characters to lower case in provided title
        const parsedTitle = title.toLowerCase().replace(/\s/g, '');

        // try to get searched title from cache
        if (this.cache.status === 'ready') {
            const cachedTitle = await this.cache.get(parsedTitle);
            if (cachedTitle) {
                logger.debug(`Key ${parsedTitle} present in cache... `);
                return cachedTitle;
            }
        }

        logger.debug(
            `Calling titleExists of MostWantedService with title ${title}, page=${page} and pageSize=${pageSize}... `
        );

        try {
            const response = await this.axios.get('list', {
                params: {
                    title: title,
                    pageSize: pageSize,
                    page: page,
                },
            });

            const items = response.data.items;
            const total = response.data.total;

            // if there are more pages fetch all data
            while (items.length < total) {
                page++;
                logger.debug(
                    `Calling titleExists of MostWantedService with title ${title}, page=${page} and pageSize=${pageSize}... `
                );
                const response = await this.axios.get('list', {
                    params: {
                        title: title,
                        pageSize: pageSize,
                        page: page,
                    },
                });

                items.push(...response.data.items);
            }

            // if length of fetched items is one, return title immediately
            if (items.length === 1) {
                logger.debug('Fetched one record, returning...');
                return items[0].title;
            }

            // get only titles from the retrieved data
            const wantedTitles = items.map(
                (obj: { title: string }) => obj.title
            );
            return await this.findMatch(wantedTitles, parsedTitle);
        } catch (e) {
            logger.error((e as Error).message);
            return;
        }
    };

    private findMatch = async (
        titles: string[],
        searchedTitle: string
    ): Promise<string | undefined> => {
        // because wanted API will return multiple matches
        // e.g for John Lima it will return both John Lima and John Doe
        // try to find the closest matching result
        let highestMatching = -1;
        const titleMatchingPairs: { title: string; matching: number }[] = [];

        for (const title of titles) {
            const titleParsed = title.toLowerCase().replace(/\s/g, '');

            // get the number of matching characters in current title and searched title
            const matching = this.getNumberOfMatchingCharacters(
                this.diff.diff_main(searchedTitle, titleParsed)
            );

            if (highestMatching === -1 || matching > highestMatching) {
                highestMatching = matching;
            }

            titleMatchingPairs.push({ title: title, matching: matching });
        }

        // filter only for those that have highest matching
        const filteredTitles = titleMatchingPairs.filter((obj) => {
            return obj.matching === highestMatching;
        });

        if (filteredTitles.length === 1) {
            logger.debug(`Found one matching title ${filteredTitles[0].title}`);
            // if title is found set cache
            if (this.cache.status === 'ready') {
                await this.cache.set(
                    searchedTitle,
                    filteredTitles[0].title,
                    'EX',
                    Envs.CACHE_TTL
                );
            }
            return filteredTitles[0].title;
        } else {
            // if length of filtered titles is other than 1, either there are no matched titles
            // or there are multiple matching so it cant be decided which one is correct
            logger.debug('Multiple or no matching titles found.');
        }
    };

    private getNumberOfMatchingCharacters = (
        distances: [number, string][]
    ): number => {
        // get number of matching characters
        const matching: string[] = distances
            .filter((d) => d[0] === 0)
            .map((d) => d[1]);
        return matching.reduce((a, b) => a + b.length, 0);
    };

    private getCache = () => {
        const redis = new Redis({
            port: Envs.CACHE_PORT,
            host: Envs.CACHE_HOST,
            password: Envs.CACHE_PASSWORD,
            retryStrategy(times) {
                const delay = Math.min(times * 500, 5000);
                return delay;
            },
        });

        redis.on('error', () => {
            logger.error(
                'Could not connect to redis server, or the connection is lost. '
            );
        });

        redis.on('ready', () => {
            logger.info('Successfully connected to redis server. ');
        });

        return redis;
    };
}
