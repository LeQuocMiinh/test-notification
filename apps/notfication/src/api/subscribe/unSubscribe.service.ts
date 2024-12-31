import { Context } from "hono";

export async function UnSubscribe(c: Context) {
    try {
        const { channelIds } = await c.req.json();

        if (!Array.isArray(channelIds) || channelIds.length === 0) {
            return c.json({ success: false, message: "No channelIds provided." }, 400);
        }

        const placeholders = channelIds.map(() => "?").join(", ");
        const query = `DELETE FROM subscribe WHERE channelId IN (${placeholders})`;

        await c.env.DB.prepare(query).bind(...channelIds).run();

        return c.json({ success: true, message: "UnSubscriptions successfully." });
    } catch (error: any) {
        return c.json({ success: false, error: error.message }, 500);
    }
}
