import { Context } from "hono";
import { notificationApns } from "../../publisher/apns-publish";
import { Env } from "../../store/interface/env";

export async function sendNotification(c: Context<{ Bindings: Env }>) {
    const dataConfigured = await c.req.json();

    if (dataConfigured.platform === 'ios') {
        notificationApns(c)
    } else {

    }
}