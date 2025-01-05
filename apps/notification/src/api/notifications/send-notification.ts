import { Context } from "hono";
import { notificationApns } from "../../publisher/apns-publisher.service";
import { Env } from "../../store/interface/env";
import { getDataByChannelId } from "../../sql";
import { getYamlFromKVStorage } from "../../store/yaml/get-yaml";
import { notificationFcm } from "../../publisher/fcm-publisher.service";
import { CombindedNotificationInterface } from "../../store/entity/combined-notification";

export async function sendNotifications(c: Context<{ Bindings: Env }>) {
    try {
        const dataConfigured: CombindedNotificationInterface = await c.req.json();
        const yamlConfig = await getYamlFromKVStorage(c.env);

        const queriesSql = await getDataByChannelId(c.env, dataConfigured.channelId);

        if (queriesSql instanceof Error) {
            return c.json({ success: false, error: queriesSql.message });
        }

        if (queriesSql.length === 0) {
            return c.json({ success: false, error: "Queried result is empty" }, 400);
        }

        let deviceTokenAndroid: string[] = [];
        await Promise.all(
            queriesSql.map(async (query) => {
                if (query.platform === 'ios') {
                    const { android, ...dataHandler } = dataConfigured;
                    return await notificationApns(dataHandler, query, yamlConfig);
                }

                if (query.platform === 'android') {
                    deviceTokenAndroid.push(query.deviceToken);
                }
            }));

        const { apns, ...dataHandler } = dataConfigured;
        await notificationFcm(dataHandler, deviceTokenAndroid, yamlConfig);

        return c.json({ success: true, message: "Sent notification to devices sucessfully" });
    } catch (error: any) {
        return c.json({ success: false, error: `Error sending notifications: ${error.message}` }, 500);
    }
}

