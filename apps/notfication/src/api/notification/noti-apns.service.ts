import { Context } from "hono";
import { yamlContentConfig } from "../../utils/yaml-config";

const apnService = yamlContentConfig.apns;

const PRIVATE_KEY = apnService.options.token.key;
const KEY_ID = apnService.options.token.keyId;
const TEAM_ID = apnService.options.token.teamId;
const BUNDLE_ID = apnService.bundleId;
const PRODUCTION_URL = "https://api.sandbox.push.apple.com";

export async function sendNotificationApns(c: Context) {
    try {
        const { deviceToken, notification, data } = await c.req.json();
        const jwt = await generateJWT(PRIVATE_KEY, KEY_ID, TEAM_ID);

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


async function generateJWT(privateKey: string, keyId: string, teamId: string) {
    const header = { alg: "ES256", kid: keyId };
    const claims = {
        iss: teamId,
        iat: Math.floor(Date.now() / 1000),
    };

    const encoder = new TextEncoder();
    const headerBase64 = btoa(JSON.stringify(header));
    const claimsBase64 = btoa(JSON.stringify(claims));
    const unsignedToken = `${headerBase64}.${claimsBase64}`;

    const key = await crypto.subtle.importKey(
        "pkcs8",
        pemToArrayBuffer(privateKey),
        { name: "ECDSA", namedCurve: "P-256" },
        false,
        ["sign"]
    );

    const signature = await crypto.subtle.sign(
        { name: "ECDSA", hash: { name: "SHA-256" } },
        key,
        encoder.encode(unsignedToken)
    );

    const signatureBase64 = btoa(String.fromCharCode(...new Uint8Array(signature)));
    return `${unsignedToken}.${signatureBase64}`;
}

export function pemToArrayBuffer(pem: string) {
    const base64 = pem.replace(/-----.*?-----/g, "").replace(/\s/g, "");
    const binary = atob(base64);
    const arrayBuffer = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        arrayBuffer[i] = binary.charCodeAt(i);
    }
    return arrayBuffer.buffer;
}


