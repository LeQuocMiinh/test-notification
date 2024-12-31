import { Hono } from "hono";
import { BlankSchema } from "hono/types";
import { Env } from "../main";

export type IHonoEnv = Hono<{ Bindings: Env }, BlankSchema, '/'>;