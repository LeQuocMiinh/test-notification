import { Context } from "hono";

export async function register(c: Context) {
    try {
        const { deviceId, appId, token, voipToken, platform, status, geocode, updateTimeLow, updateTimeHigh, updateTimeUnsigned } = await c.req.json();
        await c.env.DB.prepare("INSERT INTO register (deviceId, appId, token, voipToken, platform, status, geocode, updateTimeLow, updateTimeHigh, updateTimeUnsigned) VALUES (?, ?, ?, ?, ?, ?, ?, ? ,? ,?)")
            .bind(deviceId, appId, token, voipToken, platform, status, geocode, updateTimeLow, updateTimeHigh, updateTimeUnsigned)
            .run();

        return c.json({ success: true, message: "Register added successfully." });
    } catch (error: any) {
        return c.json({ success: false, error: error.message }, 500);
    }
}

