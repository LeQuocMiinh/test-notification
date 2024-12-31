import { Context } from 'hono';
import { Env } from '../../main';

export async function helloService(c: Context<{ Bindings: Env }>): Promise<Response> {
    return c.json({ message: "hello world", status: true });
}
