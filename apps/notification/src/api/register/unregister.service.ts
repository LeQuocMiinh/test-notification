import { Context } from "hono";
import { Env } from "../../store/interface/env";
import { UnRegisterDtoSchemaHandler } from "../../dto";

export async function unRegister(c: Context<{ Bindings: Env }>) {
    try {
        const payload = await c.req.json();

        const validData = await UnRegisterDtoSchemaHandler(payload);

        if (validData instanceof Error) {
            return c.json({ status: false, error: JSON.parse(validData.message) });
        }

        if (!Array.isArray(validData.deviceIds) || validData.deviceIds.length === 0) {
            return c.json({ success: false, message: "No deviceIds provided." }, 400);
        }

        const placeholders = validData.deviceIds.map(() => "?").join(", ");
        const query = `DELETE FROM register WHERE deviceId IN (${placeholders})`;
        await c.env.DB.prepare(query).bind(...validData.deviceIds).run();

        return c.json({ success: true, message: "UnRegister successfully." });
    } catch (error: any) {
        return c.json({ status: false, error: error.message })
    }
}