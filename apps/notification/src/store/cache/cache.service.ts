// import { logger } from '@packages/common';
// import { Env } from '../../main';

// export function processUrl(url: string): string {
//     return url.replace(/^\/+/, '');
// }

// export async function saveResponse(key: string, env: Env, data: any): Promise<Response> {
//     let value = await env.example_kv.get(key, 'text');
//     const jsonData = JSON.stringify(data);

//     if (value && value === jsonData) {
//         logger.info(`Cache hit for key: ${key}`);
//         return new Response(value, {
//             status: 200,
//             headers: { 'Content-Type': 'application/json' },
//         });
//     }

//     await env.example_kv.put(key, jsonData, { expirationTtl: 3600 });
//     logger.info(`Successfully saved ${key} to KV!`);

//     return new Response(jsonData, {
//         status: 200,
//         headers: { 'Content-Type': 'application/json' },
//     });
// }

// export async function clearKey(key: string, env: Env): Promise<Response> {
//     await env.example_kv.delete(key);
//     logger.info(`Key ${key} has been deleted from KV.`);
//     return new Response(`Key ${key} has been deleted.`, { status: 200 });
// }
