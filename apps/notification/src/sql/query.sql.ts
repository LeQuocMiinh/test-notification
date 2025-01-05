import { RegisterDtoInterface } from "../dto";
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

export async function insertRegister(env: Env, data: RegisterDtoInterface) {
  const existsRegister = await env.DB
    .prepare("SELECT * FROM register WHERE register.deviceId = ?")
    .bind(data.deviceId)
    .first();

  const insertQuery = `
    INSERT INTO 
    register (deviceId, appId, token, voipToken, platform, status, geocode, updateTimeLow, updateTimeHigh, updateTimeUnsigned)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const updateQuery = `
    UPDATE register 
    SET 
      appId = ?, 
      token = ?, 
      voipToken = ?, 
      platform = ?, 
      status = ?, 
      geocode = ?, 
      updateTimeLow = ?, 
      updateTimeHigh = ?, 
      updateTimeUnsigned = ?
    WHERE 
      deviceId = ?
  `;

  let result: any;

  if (existsRegister) {
    result = await env.DB.prepare(updateQuery)
      .bind(
        data.appId,
        data.token,
        data.voipToken,
        data.platform,
        data.status,
        data.geocode,
        data.updateTimeLow || new Date().toISOString(),
        data.updateTimeHigh || null,
        data.updateTimeUnsigned || null,
        data.deviceId
      )
      .run();
  } else {
    result = await env.DB.prepare(insertQuery)
      .bind(
        data.deviceId,
        data.appId,
        data.token,
        data.voipToken,
        data.platform,
        data.status,
        data.geocode,
        data.updateTimeLow || new Date().toISOString(),
        data.updateTimeHigh || null,
        data.updateTimeUnsigned || null
      )
      .run();
  }

  return result;
}
