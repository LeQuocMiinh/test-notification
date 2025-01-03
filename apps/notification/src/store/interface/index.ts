import { Hono } from "hono";
import { BlankSchema } from "hono/types";
import { Env } from "./env";

export type IHonoEnv = Hono<{ Bindings: Env }, BlankSchema, '/'>;