import { Context } from "hono";
import { Env } from "../../store/interface/env";
import { UnSubscribeDtoSchemaHandler } from "../../dto";

export async function unSubscribe(c: Context<{ Bindings: Env }>) {
    try {
        const payload = await c.req.json();

        const validData = await UnSubscribeDtoSchemaHandler(payload);

        if (validData instanceof Error) {
            return c.json({ status: false, error: JSON.parse(validData.message) });
        }

        if (!Array.isArray(validData.channelIds) || validData.channelIds.length === 0) {
            return c.json({ success: false, message: "No channelIds provided." }, 400);
        }

        const placeholders = validData.channelIds.map(() => "?").join(", ");
        const query = `DELETE FROM subscribe WHERE channelId IN (${placeholders})`;

        await c.env.DB.prepare(query).bind(...validData.channelIds).run();

        return c.json({ success: true, message: "UnSubscriptions successfully." });
    } catch (error: any) {
        return c.json({ success: false, error: error.message }, 500);
    }
}
