import { FcmMessage } from 'fcm-cloudflare-workers';
import { Context } from 'hono';
import admin from 'firebase-admin';
import { getOrThrow, logger } from '@packages/common';
import { yamlContentConfig } from '../../utils/yaml-config';
import { FcmErrorResponse, FcmTokenResponse } from '../../store/entity/fcm-responses';
import { createJWT } from '../../utils/create-jwt';
import { FcmOptions } from '../../store/entity/fcm-options';

const app = admin.initializeApp({
    credential: admin.credential.cert(yamlContentConfig.fcm.serviceAccount)
});

const serviceAccount = yamlContentConfig.fcm.serviceAccount;
const fcmHost: string = "https://fcm.googleapis.com";

export async function sendToNotification(c: Context) {
    const { data, deviceToken } = await c.req.json();

    try {
        const unregisteredTokens = sendMulticast(data, [deviceToken]);
        logger.info("Message sent successfully");

    } catch (error) {
        console.error(error);
        return c.json({ success: false, message: "Sending Failed" }, 400);
    }

    return c.json({ success: true });
}

async function getAccessToken(): Promise<string> {
    if (!serviceAccount) {
        throw new Error("Service account is not defined.");
    }

    // Generate a new JWT
    const now = Math.floor(Date.now() / 1000);
    const ttl = 3600; // 1 hour
    const payload = {
        iss: serviceAccount.client_email,
        scope: "https://www.googleapis.com/auth/firebase.messaging",
        aud: "https://oauth2.googleapis.com/token",
        exp: now + ttl,
        iat: now,
    };

    try {
        const jwt = await createJWT(
            payload,
            serviceAccount.private_key
        );

        const response = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = (await response.json()) as FcmTokenResponse;
        const newAccessToken = data.access_token;


        return newAccessToken;
    } catch (error) {
        console.error("Error getting access token:", error);
        throw error;
    }
}

async function sendMulticast(
    message: FcmMessage,
    tokens: Array<string>
): Promise<Array<string>> {
    if (!message) {
        throw new Error("Message is required");
    }

    if (!tokens?.length) {
        throw new Error("Token array is required");
    }

    const unregisteredTokens: Array<string> = [];
    const projectId = serviceAccount?.project_id;

    if (!projectId) {
        throw new Error(
            "Unable to determine Firebase Project ID from service account file."
        );
    }

    if (!serviceAccount) {
        throw new Error("Service account is not defined.");
    }

    try {
        const accessToken = await getAccessToken();

        // Chuyển tất cả tokens vào một batch duy nhất
        const results = await Promise.allSettled(
            tokens.map((token) =>
                processBatch(message, [token], projectId, accessToken)
            )
        );

        results.forEach((result) => {
            if (result.status === "fulfilled") {
                unregisteredTokens.push(...result.value);
            } else {
                console.error("Error processing token:", result.reason);
            }
        });

        return unregisteredTokens;
    } catch (err) {
        console.error("Error sending multicast:", err);
        throw err;
    }
}

async function processBatch(
    message: any,
    devices: Array<string>,
    projectId: string,
    accessToken: string
): Promise<Array<string>> {
    const unregisteredTokens: Array<string> = [];
    const errors: Error[] = [];

    const results = await Promise.allSettled(
        devices.map((device) =>
            sendRequest(device, message, projectId, accessToken)
        )
    );

    results.forEach((result, index) => {
        if (result.status === "rejected") {
            if (result.reason.message === "UNREGISTERED") {
                unregisteredTokens.push(devices[index]);
            } else {
                errors.push(result.reason);
            }
        }
    });

    if (errors.length > 0) {
        console.error(`Errors occurred while processing batch: ${errors.length}`);
        errors.forEach((error) => console.error(error));
    }

    return unregisteredTokens;
}

/**
 * @deprecated This is an internal method that will be removed in a future version.
 * Use sendToToken, sendToTokens, sendToTopic, or sendToCondition instead.
 * @internal
 */
async function sendRequest(
    device: string,
    message: any,
    projectId: string,
    accessToken: string,
    tries = 0
): Promise<void> {
    const url = `${fcmHost}/v1/projects/${projectId}/messages:send`;
    const clonedMessage = { ...message, token: device };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ message: clonedMessage }),
        });

        if (!response.ok) {
            const data = (await response.json()) as FcmErrorResponse;

            if (response.status >= 500 && tries < 3) {
                console.warn("Server error, retrying...", data);
                await new Promise((resolve) =>
                    setTimeout(resolve, 1000 * (tries + 1))
                );
                return sendRequest(
                    device,
                    message,
                    projectId,
                    accessToken,
                    tries + 1
                );
            } else if (
                response.status === 400 &&
                data.error &&
                data.error.message.includes("not a valid FCM registration token")
            ) {
                throw new Error("UNREGISTERED");
            } else {
                throw new Error(
                    `HTTP error! status: ${response.status}, message: ${data.error?.message || response.statusText
                    }`
                );
            }
        }
    } catch (error) {
        console.error(`Error sending request to device ${device}:`, error);
        throw error;
    }
}