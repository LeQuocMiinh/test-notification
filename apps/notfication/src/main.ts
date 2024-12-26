import { Hono } from 'hono';
import { routes } from './route';
import { Env } from './store/cache/cache.service';
import { setupConfiguration } from '@packages/common';

setupConfiguration();

const app = new Hono<{ Bindings: Env }>();

routes(app);


export default { fetch: app.fetch };