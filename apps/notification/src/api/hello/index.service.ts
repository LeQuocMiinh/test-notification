import { Context } from 'hono';
import { Env } from '../../store/interface/env';

export async function helloService(c: Context<{ Bindings: Env }>): Promise<Response> {
    return c.json({ message: "hello world", status: true });
}
