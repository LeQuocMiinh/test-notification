import { Context, Hono } from 'hono';
import { routes } from './route/route';
import { IHonoEnv } from './interface';
import { D1Database, KVNamespace } from '@cloudflare/workers-types';
export interface Env {
    DB: D1Database;
    yaml_kv: KVNamespace;
}

const app: IHonoEnv = new Hono<{ Bindings: Env }>();

routes(app);

export default { fetch: app.fetch };