import { Context } from "hono";
import { Env } from "../../store/interface/env";
import { SubscribeDtoSchemaHandler } from "../../dto";

export async function subcribe(c: Context<{ Bindings: Env }>) {
    try {
        const payload = await c.req.json();

        const validData = await SubscribeDtoSchemaHandler(payload);

        if (validData instanceof Error) {
            return c.json({ status: false, message: JSON.parse(validData.message) });
        }

        const existingSubscription = await c.env.DB.prepare(
            "SELECT * FROM subscribe WHERE channelId = ?"
        )
            .bind(validData.channelId)
            .first();

        if (existingSubscription) {
            await c.env.DB.prepare(
                "UPDATE subscribe SET deviceToken = ? WHERE channelId = ?"
            )
                .bind(validData.deviceToken, validData.channelId)
                .run();

            return c.json({ success: true, message: "Subscription updated successfully." });
        } else {
            await c.env.DB.prepare(
                "INSERT INTO subscribe (channelId, deviceToken) VALUES (?, ?)"
            )
                .bind(validData.channelId, validData.deviceToken)
                .run();

            return c.json({ success: true, message: "Subscription added successfully." });
        }
    } catch (error: any) {
        return c.json({ success: false, error: error.message }, 500);
    }
}
