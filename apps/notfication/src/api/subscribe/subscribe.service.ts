import { Context } from "hono";

export async function subcribe(c: Context) {
    try {
        const { channelId, deviceToken, deviceType } = await c.req.json();

        const existingSubscription = await c.env.DB.prepare(
            "SELECT * FROM subscribe WHERE channelId = ?"
        )
            .bind(channelId)
            .first();

        if (existingSubscription) {
            await c.env.DB.prepare(
                "UPDATE subscribe SET deviceToken = ?, deviceType = ? WHERE channelId = ?"
            )
                .bind(deviceToken, deviceType, channelId)
                .run();

            return c.json({ success: true, message: "Subscription updated successfully." });
        } else {
            await c.env.DB.prepare(
                "INSERT INTO subscribe (channelId, deviceToken, deviceType) VALUES (?, ?, ?)"
            )
                .bind(channelId, deviceToken, deviceType)
                .run();

            return c.json({ success: true, message: "Subscription added successfully." });
        }
    } catch (error: any) {
        return c.json({ success: false, error: error.message }, 500);
    }
}
