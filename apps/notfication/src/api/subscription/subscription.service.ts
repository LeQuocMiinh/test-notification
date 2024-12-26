import { Context } from "hono";

export async function subcribe(c: Context) {
    try {
        console.log("DB Binding:", c.env.DB);
        const { channelId, deviceToken, deviceType } = await c.req.json();
        await c.env.DB.prepare("INSERT INTO subscription (channelId, deviceToken, deviceType) VALUES (?, ?, ?)")
            .bind(channelId, deviceToken, deviceType)
            .run();

        return c.json({ success: true, message: "Subscription added successfully." });
    } catch (error: any) {
        return c.json({ success: false, error: error.message }, 500);
    }
}

