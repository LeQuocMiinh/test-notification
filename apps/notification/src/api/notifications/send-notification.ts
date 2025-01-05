import { Context } from "hono";
import { notificationApns } from "../../publisher/apns-publisher.service";
import { Env } from "../../store/interface/env";
import { getDataByChannelId } from "../../sql";
import { getYamlFromKVStorage } from "../../store/yaml/get-yaml";
import { notificationFcm } from "src/publisher/fcm-publisher.service";
import { CombindedNotificationInterface } from "src/store/entity/combined-notification";

export async function sendNotifications(c: Context<{ Bindings: Env }>) {
    try {
        const dataConfigured: CombindedNotificationInterface = await c.req.json();
        const yamlConfig = await getYamlFromKVStorage(c.env);

        const queriesSql = await getDataByChannelId(c.env, dataConfigured.channelId);

        if (queriesSql instanceof Error) {
            return c.json({ status: false, error: queriesSql.message });
        }

        if (queriesSql.length === 0) {
            return c.json({ status: false, error: "Queried result is empty" }, 400);
        }
        let deviceTokenAndroid: string[] = [];
        const results = await Promise.all(
            queriesSql.map(async (query) => {
                if (query.platform === 'ios') {
                    const { android, ...dataHandler } = dataConfigured;
                    return await notificationApns(dataHandler, query, yamlConfig);
                }

                if (query.platform === 'android') {
                    deviceTokenAndroid.push(query.deviceToken);
                }

            }))
        return c.json({ status: true, results: results.filter(e => e != null) });

    } catch (error: any) {
        return c.json({ status: false, error: `Error sending notifications: ${error.message}` }, 500);
    }
}

