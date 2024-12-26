import { FcmMessage } from 'fcm-cloudflare-workers';
import { Context } from 'hono';
import * as admin from 'firebase-admin';
import { getOrThrow, logger } from '@packages/common';

export async function sendToNotification(c: Context) {
    const { data, deviceToken } = await c.req.json();

    const message = {
        notification: {
            title: data.title,
            body: data.body,
        },
        data: {
            notification: "true",
        },
    };

    try {
        const unregisteredTokens = await sendMulticast(message, [deviceToken]);
        logger.info("Message sent successfully");

        if (unregisteredTokens.length > 0) {
            logger.info("Unregistered device token(s): ", unregisteredTokens.join(", "));
        }
    } catch (error) {
        console.error(error);
        return c.json({ success: false, message: "Sending Failed" }, 400);
    }

    return c.json({ success: true });
}

async function sendMulticast(
    message: FcmMessage,
    tokens: Array<string>
): Promise<Array<string>> {
    if (!tokens?.length) {
        throw new Error("Token array is required");
    }

    const unregisteredTokens: Array<string> = [];
    const projectId = "zii-sandbox";
    const accessToken = await getAccessToken();

    const results = await Promise.allSettled(
        tokens.map((token) =>
            sendRequest(token, message, projectId, accessToken)
        )
    );

    results.forEach((result, index) => {
        if (result.status === "rejected") {
            if (result.reason.message === "UNREGISTERED") {
                unregisteredTokens.push(tokens[index]);
            } else {
                console.error("Error:", result.reason);
            }
        }
    });

    return unregisteredTokens;
}

async function sendRequest(
    deviceToken: string,
    message: any,
    projectId: string,
    accessToken: string
): Promise<void> {
    const url = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`;
    const body = {
        message: {
            ...message,
            token: deviceToken,
        },
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const data: any = await response.json();
            if (
                response.status === 400 &&
                data.error?.message?.includes("not a valid FCM registration token")
            ) {
                throw new Error("UNREGISTERED");
            } else {
                throw new Error(`Error: ${data.error?.message || response.statusText}`);
            }
        }
    } catch (error) {
        console.error(`Error sending request to device ${deviceToken}:`, error);
        throw error;
    }
}

// Lấy Access Token
async function getAccessToken(): Promise<any> {
    try {
        const serviceAccount: admin.ServiceAccount = await getOrThrow('fcm.serviceAccount');
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });

        const token = await admin.credential.cert(serviceAccount).getAccessToken();
        return token.access_token;
    } catch (error) {
        console.error('Lỗi khi lấy Access Token:', error);
        throw new Error('Failed to retrieve access token');
    }
}
