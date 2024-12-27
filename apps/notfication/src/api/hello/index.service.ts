import { Context } from 'hono';
import { processUrl, saveResponse, Env } from '../../store/cache/cache.service';

export async function helloService(c: Context<{ Bindings: Env }>): Promise<Response> {
    return c.json({ message: "hello world", status: true });
}
