import { createJwtForApns } from "../utils/apns-jwt";
import { ApnsDtoSchemaHandler, SubscribeRegisterDataInterface } from "../dto";
import { ApnsNotificationInterface } from "src/store/entity/combined-notification";

const PRODUCTION_URL = "https://api.push.apple.com";

export async function notificationApns(data: ApnsNotificationInterface, query: SubscribeRegisterDataInterface, yamlConfig: any) {
    try {
        const validData = await ApnsDtoSchemaHandler(data);

        if (validData instanceof Error) {
            throw new Error(validData.message);
        }

        const result = await sendRequest(validData, query.deviceToken, yamlConfig);

        return { message: "Notification sent successfully", data: result };
    } catch (error: any) {
        throw new Error(error.message);
    }
}

async function sendRequest(data: ApnsNotificationInterface, deviceToken: string, yamlConfig: any) {
    const PRIVATE_KEY = yamlConfig?.apns?.options.token.key;
    const KEY_ID = yamlConfig?.apns?.options.token.keyId;
    const TEAM_ID = yamlConfig?.apns?.options.token.teamId;
    const BUNDLE_ID = yamlConfig?.apns?.bundleId;
    const OUTDATED = yamlConfig?.notificationOption;
    const jwt = await createJwtForApns(PRIVATE_KEY, KEY_ID, TEAM_ID);
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const callExpiry = currentTimestamp + OUTDATED;
    const defaultExpiry = currentTimestamp + 3600;
    const payload = JSON.stringify({
        aps: {
            alert:
                data.apns?.args && data.apns?.args.length
                    ? {
                        loc_key: data.title?.toUpperCase().replace(/\s+/g, '_'),
                        loc_args: data.apns?.args,
                    }
                    : {
                        title: data.title,
                        body: data.body,
                    },

            category: data.apns?.category || null,
            badge: 1,
            sound: OUTDATED.sound,
        },
        data: data.data || {}
    });

    const headers = {
        'Authorization': `Bearer ${jwt}`,
        'Content-Type': 'application/json',
        'apns-topic': `${data.apns?.isVoip ? `${BUNDLE_ID}.voip` : BUNDLE_ID}`,
        'apns-push-type': 'alert', // Required for iOS 13+
        'apns-expiration': `${data.apns?.isVoip ? callExpiry : defaultExpiry}`,
        'apns-priority': `${data.apns?.isVoip ? 5 : data.apns?.priority}`,
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

    return data.data;
}