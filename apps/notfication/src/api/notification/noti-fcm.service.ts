// import { FcmMessage } from 'fcm-cloudflare-workers';
// import { Context } from 'hono';
// import { logger } from '@packages/common';
// import { yamlContentConfig } from '../../utils/yaml-config';
// import { FcmErrorResponse, FcmTokenResponse } from '../../store/entity/fcm-responses';
// import { createJWT } from '../../utils/create-jwt';

// const serviceAccount = yamlContentConfig.fcm.serviceAccount;
// const fcmHost: string = "https://fcm.googleapis.com";

// export async function sendToNotification(c: Context) {
//     const { data, deviceToken } = await c.req.json();

//     try {
//         const unregisteredTokens = await sendMulticast(data, [deviceToken]);
//         logger.info("Message sent successfully");

//         if (unregisteredTokens.length > 0) {
//             logger.info("Unregistered device token(s): ", unregisteredTokens.join(", "));
//         }
//     } catch (error) {
//         console.error(error);
//         return c.json({ success: false, message: "Sending Failed" }, 400);
//     }

//     return c.json({ success: true });
// }

// async function getAccessToken(): Promise<string> {
//     if (!serviceAccount) {
//         throw new Error("Service account is not defined.");
//     }

//     const now = Math.floor(Date.now() / 1000);
//     const ttl = 3600; // 1 hour
//     const payload = {
//         iss: serviceAccount.client_email,
//         scope: "https://www.googleapis.com/auth/firebase.messaging",
//         aud: "https://oauth2.googleapis.com/token",
//         exp: now + ttl,
//         iat: now,
//     };

//     try {
//         const jwt = await createJWT(
//             payload,
//             serviceAccount.private_key
//         );

//         const response = await fetch("https://oauth2.googleapis.com/token", {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/x-www-form-urlencoded",
//             },
//             body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
//         });

//         if (!response.ok) {
//             throw new Error(`HTTP error! status: ${response.status}`);
//         }

//         const data = (await response.json()) as FcmTokenResponse;
//         const newAccessToken = data.access_token;


//         return newAccessToken;
//     } catch (error) {
//         console.error("Error getting access token:", error);
//         throw error;
//     }
// }

// async function sendMulticast(
//     message: FcmMessage,
//     tokens: Array<string>
// ): Promise<Array<string>> {
//     if (!message) {
//         throw new Error("Message is required");
//     }

//     if (!tokens?.length) {
//         throw new Error("Token array is required");
//     }

//     const unregisteredTokens: Array<string> = [];
//     const projectId = serviceAccount?.project_id;

//     if (!projectId) {
//         throw new Error(
//             "Unable to determine Firebase Project ID from service account file."
//         );
//     }

//     if (!serviceAccount) {
//         throw new Error("Service account is not defined.");
//     }

//     try {
//         const accessToken = await getAccessToken();

//         // Chuyển tất cả tokens vào một batch duy nhất
//         const results = await Promise.allSettled(
//             tokens.map((token) =>
//                 processBatch(message, [token], projectId, accessToken)
//             )
//         );

//         results.forEach((result) => {
//             if (result.status === "fulfilled") {
//                 unregisteredTokens.push(...result.value);
//             } else {
//                 console.error("Error processing token:", result.reason);
//             }
//         });

//         return unregisteredTokens;
//     } catch (err) {
//         console.error("Error sending multicast:", err);
//         throw err;
//     }
// }

// async function processBatch(
//     message: any,
//     devices: Array<string>,
//     projectId: string,
//     accessToken: string
// ): Promise<Array<string>> {
//     const unregisteredTokens: Array<string> = [];
//     const errors: Error[] = [];

//     const results = await Promise.allSettled(
//         devices.map((device) =>
//             sendRequest(device, message, projectId, accessToken)
//         )
//     );

//     results.forEach((result, index) => {
//         if (result.status === "rejected") {
//             if (result.reason.message === "UNREGISTERED") {
//                 unregisteredTokens.push(devices[index]);
//             } else {
//                 errors.push(result.reason);
//             }
//         }
//     });

//     if (errors.length > 0) {
//         console.error(`Errors occurred while processing batch: ${errors.length}`);
//         errors.forEach((error) => console.error(error));
//     }

//     return unregisteredTokens;
// }

// async function sendRequest(
//     device: string,
//     message: any,
//     projectId: string,
//     accessToken: string,
//     tries = 0
// ): Promise<void> {
//     const url = `${fcmHost}/v1/projects/${projectId}/messages:send`;
//     const clonedMessage = { ...message, token: device };

//     try {
//         const response = await fetch(url, {
//             method: "POST",
//             headers: {
//                 Authorization: `Bearer ${accessToken}`,
//                 "Content-Type": "application/json",
//             },
//             body: JSON.stringify({ message: clonedMessage }),
//         });

//         if (!response.ok) {
//             const data = (await response.json()) as FcmErrorResponse;

//             if (response.status >= 500 && tries < 3) {
//                 console.warn("Server error, retrying...", data);
//                 await new Promise((resolve) =>
//                     setTimeout(resolve, 1000 * (tries + 1))
//                 );
//                 return sendRequest(
//                     device,
//                     message,
//                     projectId,
//                     accessToken,
//                     tries + 1
//                 );
//             } else if (
//                 response.status === 400 &&
//                 data.error &&
//                 data.error.message.includes("not a valid FCM registration token")
//             ) {
//                 throw new Error("UNREGISTERED");
//             } else {
//                 throw new Error(
//                     `HTTP error! status: ${response.status}, message: ${data.error?.message || response.statusText
//                     }`
//                 );
//             }
//         }
//     } catch (error) {
//         console.error(`Error sending request to device ${device}:`, error);
//         throw error;
//     }
// }

const PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----
your key
-----END PRIVATE KEY-----`;

const KEY_ID = "8SJJXJWMAX";
const TEAM_ID = "5MBUW9X833";
const BUNDLE_ID = "com.ziichat.ios.media.beta";
const PRODUCTION_URL = "https://api.push.apple.com";

addEventListener("fetch", (event) => {
    event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
    if (request.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405 });
    }

    const payload = await request.json();

    const jwt = await generateJWT(PRIVATE_KEY, KEY_ID, TEAM_ID);
    const response = await sendNotification(jwt, payload);

    return new Response(JSON.stringify(response), {
        headers: { "Content-Type": "application/json" },
        status: response.success ? 200 : 500,
    });
}

async function generateJWT(privateKey, keyId, teamId) {
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

function pemToArrayBuffer(pem) {
    const base64 = pem.replace(/-----.*?-----/g, "").replace(/\s/g, "");
    const binary = atob(base64);
    const arrayBuffer = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        arrayBuffer[i] = binary.charCodeAt(i);
    }
    return arrayBuffer.buffer;
}

async function sendNotification(jwt, payload) {
    const deviceToken = payload.deviceToken; // Device token gửi từ client
    const notification = payload.notification; // Nội dung thông báo

    const response = await fetch(`${PRODUCTION_URL}/3/device/${deviceToken}`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${jwt}`,
            "Content-Type": "application/json",
            "apns-topic": BUNDLE_ID,
        },
        body: JSON.stringify({
            aps: {
                alert: {
                    title: notification.title,
                    body: notification.body,
                },
                badge: 1,
                sound: "default",
            },
            data: payload.data || {},
        }),
    });

    return {
        success: response.ok,
        status: response.status,
        body: await response.text(),
    };
}
