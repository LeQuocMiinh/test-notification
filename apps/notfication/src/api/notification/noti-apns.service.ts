import { Context } from "hono";
import { yamlContentConfig } from "../../utils/yaml-config";
import { createJwtForApns } from "../../utils/apns-jwt";
import { Env } from "../../main";

const apnService = yamlContentConfig.apns;

const PRIVATE_KEY = apnService.options.token.key;
const KEY_ID = apnService.options.token.keyId;
const TEAM_ID = apnService.options.token.teamId;
const BUNDLE_ID = apnService.bundleId;
const PRODUCTION_URL = "https://api.push.apple.com";

export async function sendNotificationApns(c: Context<{ Bindings: Env }>) {
    try {
        const { deviceToken, notification, data } = await c.req.json();
        const jwt = await createJwtForApns(PRIVATE_KEY, KEY_ID, TEAM_ID);

        const payload = JSON.stringify({
            aps: {
                alert: notification,
                badge: 1,
                sound: "default",
            },
            data: data || {},
        });

        const headers = {
            'Authorization': `Bearer ${jwt}`,
            'Content-Type': 'application/json',
            'apns-topic': BUNDLE_ID,
            'apns-push-type': 'alert', // Required for iOS 13+
            'apns-expiration': '0',
            'apns-priority': '10',
        };

        const response = await fetch(`${PRODUCTION_URL}/3/device/${deviceToken}`, {
            method: 'POST',
            headers,
            body: payload,
        });

        const responseText = await response.text();

        if (!response.ok) {
            throw new Error(`APNs error: ${response.status} - ${responseText}`);
        }

        return c.json({ status: true, message: "Notification sent successfully", data: responseText });
    } catch (error: any) {
        console.error("Failed to send notification:", error.message);
        return c.json({ success: false, error: error.message }, 500);
    }
}


