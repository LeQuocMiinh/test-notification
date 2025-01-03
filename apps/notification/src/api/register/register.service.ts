import { Context } from "hono";
import { Env } from "../../store/interface/env";
import { RegisterDtoSchemaHandler } from "../../dto";

export async function register(c: Context<{ Bindings: Env }>) {
    try {
        const payload = await c.req.json();

        const validData = await RegisterDtoSchemaHandler(payload);

        if (validData instanceof Error) {
            return c.json({ success: false, error: JSON.parse(validData.message) }, 400);
        }

        await c.env.DB.prepare("INSERT INTO register (deviceId, appId, token, voipToken, platform, status, geocode, updateTimeLow, updateTimeHigh, updateTimeUnsigned) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
            .bind(
                validData.deviceId,
                validData.appId,
                validData.token,
                validData.voipToken,
                validData.platform,
                validData.status,
                validData.geocode,
                validData.updateTimeLow || new Date().toISOString(),
                validData.updateTimeHigh || null,
                validData.updateTimeUnsigned || null
            )
            .run();

        return c.json({ success: true, message: "Register added successfully." });
    } catch (error: any) {
        return c.json({ success: false, error: error.message || "Internal server error" }, 500);
    }
}
