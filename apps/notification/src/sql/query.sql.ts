import { SubscribeRegisterDataInterface } from "../dto/subscribe-register.dto";
import { Env } from "../store/interface/env";

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
