import { Context } from 'hono';
import { processUrl, saveResponse, Env } from '../../store/cache/cache.service';

export async function helloService(c: Context<{ Bindings: Env }>): Promise<Response> {
    //const key = processUrl(c.req.path);
    const { a, b } = await c.req.json();

    return c.json({ result: `${a + b}` });
}
