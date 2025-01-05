import { logger } from '@packages/common';
import { FcmTokenResponse } from '../store/entity/fcm-responses';
import { createJwtForFCM } from '../utils/fcm-jwt';
import { FcmMessage } from '../store/entity/fcm-message';
import { FcmDtoSchemaHandler } from '../dto/fcm.dto';
import { FcmNotificationInterface } from '../store/entity/combined-notification';

let serviceAccount: any;
const fcmHost: string = "https://fcm.googleapis.com";

export async function notificationFcm(data: FcmNotificationInterface, deviceToken: Array<string>, yamlConfig: any) {
    serviceAccount = yamlConfig?.fcm?.serviceAccount;
    try {
        const validData = await FcmDtoSchemaHandler(data);

        if (validData instanceof Error) {
            throw new Error(validData.message);
        }
        const { channelId, ...dataHandler } = data;
        const unregisteredTokens = await sendMulticast(dataHandler, deviceToken);

        if (unregisteredTokens.length > 0) {
            logger.info("Unregistered device token(s): ", unregisteredTokens.join(", "));
        }
        return { status: true, message: "Sent notification sucessfully" };

    } catch (error: any) {
        throw new Error(error.message);
    }
}

async function getAccessToken(): Promise<string> {
    if (!serviceAccount) {
        throw new Error("Service account is not defined.");
    }

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
        const jwt = await createJwtForFCM(
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

async function sendMulticast(message: FcmNotificationInterface, tokens: string[]): Promise<string[]> {
    const projectId = serviceAccount?.project_id;

    if (!projectId || !serviceAccount) {
        throw new Error("Invalid service account configuration.");
    }

    const unregisteredTokens: string[] = [];
    try {
        const accessToken = await getAccessToken();

        const results = await Promise.allSettled(
            tokens.map((token) => sendRequest(message, token, projectId, accessToken))
        );

        results.forEach((result, index) => {
            if (result.status === "rejected" && result.reason.message === "UNREGISTERED") {
                unregisteredTokens.push(tokens[index]);
            }
        });

        return unregisteredTokens;
    } catch (error) {
        logger.error("Failed to send multicast messages:", error);
        throw error;
    }
}


async function sendRequest(
    message: FcmNotificationInterface,
    deviceToken: string,
    projectId: string,
    accessToken: string,
    tries = 0
): Promise<void> {
    if (!message || !deviceToken || !projectId || !accessToken) {
        throw new Error("Missing required parameters for FCM request.");
    }

    const url = `${fcmHost}/v1/projects/${projectId}/messages:send`;
    const headers = {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
    };
    const clonedMessage = {
        ...message,
        token: deviceToken,
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers,
            body: JSON.stringify({ message: clonedMessage }),
        });

        if (!response.ok) {
            const data = await response.json();

            if (response.status >= 500 && tries < 3) {
                await new Promise((resolve) => setTimeout(resolve, 1000 * (tries + 1)));
                return sendRequest(message, deviceToken, projectId, accessToken, tries + 1);
            }

            if (response.status === 400 && data.error?.message.includes("not a valid FCM registration token")) {
                throw new Error("UNREGISTERED");
            }

            logger.error(`FCM Error Response:`, {
                status: response.status,
                message: data.error?.message,
            });
            throw new Error(`Error: ${data.error?.message || response.statusText}`);
        }
    } catch (error) {
        logger.error(`Request failed for token ${deviceToken}:`, error);
        throw error;
    }
}



