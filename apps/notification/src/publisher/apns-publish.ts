import { Context } from "hono";
import { createJwtForApns } from "../utils/apns-jwt";
import { Env } from "../store/interface/env";
import { getYamlFromKVStorage } from "../store/yaml/get-yaml";
import { ApnsDtoSchemaHandler } from "../dto";
import { SubscribeRegisterDataInterface } from "src/dto/subscribe-register.dto";

const PRODUCTION_URL = "https://api.push.apple.com";

export async function notificationApns(c: Context<{ Bindings: Env }>) {
    try {
        const yamlConfig = await getYamlFromKVStorage(c.env);
        const PRIVATE_KEY = yamlConfig?.apns?.options.token.key;
        const KEY_ID = yamlConfig?.apns?.options.token.keyId;
        const TEAM_ID = yamlConfig?.apns?.options.token.teamId;
        const BUNDLE_ID = yamlConfig?.apns?.bundleId;
        const jwt = await createJwtForApns(PRIVATE_KEY, KEY_ID, TEAM_ID);

        const data = await c.req.json();

        const validData = await ApnsDtoSchemaHandler(data);

        if (validData instanceof Error) {
            return c.json({ status: false, error: validData.message });
        }

        const dataChannelId = await getDataByChannelId(c.env, validData.channelId);

        if (dataChannelId instanceof Error) {
            return c.json({ status: false, error: dataChannelId.message });
        };

        for (const )

        const payload = JSON.stringify({
            aps: {
                alert: {
                    title: validData.title,
                    body: validData.body
                },
                badge: validData.badge,
                sound: "default",
            },
            data: validData.data
        });

        const headers = {
            'Authorization': `Bearer ${jwt}`,
            'Content-Type': 'application/json',
            'apns-topic': BUNDLE_ID,
            'apns-push-type': 'alert', // Required for iOS 13+
            'apns-expiration': '0',
            'apns-priority': '10',
        };

        const response = await fetch(`${PRODUCTION_URL}/3/device/${}`, {
            method: 'POST',
            headers,
            body: payload,
        });

        const responseText = await response.text();

        if (!response.ok) {
            throw new Error(`APNs error: ${response.status} - ${responseText}`);
        }

        return c.json({ status: true, message: "Notification sent successfully" });
    } catch (error: any) {
        console.error("Failed to send notification:", error.message);
        return c.json({ success: false, error: error.message }, 500);
    }
}

export async function getDataByChannelId(env: Env, channelId: string): Promise<SubscribeRegisterDataInterface[] | Error> {
    const query = `
      SELECT 
        subscribe.channelId,
        subscribe.deviceToken,
        register.deviceId,
        register.appId,
        register.voipToken,
        register.platform,
        register.status,
        register.geocode,
        register.updateTimeLow,
        register.updateTimeHigh,
        register.updateTimeUnsigned
      FROM 
        subscribe
      JOIN 
        register
      ON 
        subscribe.deviceToken = register.token
      WHERE 
        subscribe.channelId = ?;
    `;

    try {
        const result = await env.DB.prepare(query).bind(channelId).all();

        if (!result.results) {
            return [];
        }

        return result.results.map((row) => ({
            channelId: row.channelId,
            deviceToken: row.deviceToken,
            deviceId: row.deviceId,
            appId: row.appId,
            voipToken: row.voipToken,
            platform: row.platform,
            status: row.status || null,
            geocode: row.geocode,
            updateTimeLow: row.updateTimeLow,
            updateTimeHigh: row.updateTimeHigh,
            updateTimeUnsigned: row.updateTimeUnsigned,
        })) as SubscribeRegisterDataInterface[];
    } catch (error: any) {
        return new Error(error.message)
    }
}
