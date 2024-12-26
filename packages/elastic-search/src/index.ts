import { Client } from 'elasticsearch';
import { getOrThrow, setupConfiguration } from '@packages/common';

type ElasticSearch = {
    protocol: string;
    username?: string;
    password?: string;
    server: string;
    port: string;
}

export type Client = {
    client: Client;
}

setupConfiguration();

async function connectionElasticSearch(index: string) {
    let hosts: string;
    const data = getOrThrow<ElasticSearch>('elastic-search');

    if (data.username && data.password) {
        hosts = `${data.protocol}://${data.username}:${data.password}@${data.server}:${data.port}`;
    } else {
        hosts = `${data.protocol}://${data.server}:${data.port}`;
    }

    const client = new Client({
        hosts
    });

    if (index) {
        try {
            const exists = await client.indices.exists({ index });
            if (!exists) {
                throw new Error(`Index "${index}" does not exist`);
            }
        } catch (error: any) {
            throw new Error(`Error checking index "${index}": ${error.message}`);
        }
    }

    return { client, index };
}

export { connectionElasticSearch };


