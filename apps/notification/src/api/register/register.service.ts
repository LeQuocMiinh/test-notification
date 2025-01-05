import { Context } from "hono";
import { Env } from "../../store/interface/env";
import { RegisterDtoSchemaHandler } from "../../dto";
import { insertRegister } from "../../sql";

export async function register(c: Context<{ Bindings: Env }>) {
    try {
        const payload = await c.req.json();

        const validData = await RegisterDtoSchemaHandler(payload);

        if (validData instanceof Error) {
            return c.json({ success: false, error: JSON.parse(validData.message) }, 400);
        }

        const query = await insertRegister(c.env, validData);

        if (!query.success) {
            return c.json({ success: false, error: query.error });
        }

        return c.json({ success: true, message: "Register added successfully", query });
    } catch (error: any) {
        return c.json({ success: false, error: error.message || "Internal server error" }, 500);
    }
}
