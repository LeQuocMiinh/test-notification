import { Hono } from 'hono';
import { routes } from './route/route';
import { IHonoEnv } from './store/interface';
import { Env } from './store/interface/env';

const app: IHonoEnv = new Hono<{ Bindings: Env }>();

routes(app);

export default { fetch: app.fetch };