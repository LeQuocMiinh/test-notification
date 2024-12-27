import { getOrThrow, logger, setupConfiguration } from '@packages/common';
import * as apns from 'apn';
import { Context } from 'hono';
import { yamlContentConfig } from '../../utils/yaml-config';

export async function sendNotificationApns(c: Context) {
    const options: any = yamlContentConfig.apns.options;
    const bundleId = yamlContentConfig.apns.bundleId;
    const { message, deviceToken } = await c.req.json();

    const apnsConnection = new apns.Provider(options);

    const note = new apns.Notification(
        {
            alert: message,
            badge: 1,
            sound: "default",
            topic: bundleId,
        }
    );

    try {
        const result = await apnsConnection.send(note, deviceToken);

        if (result.failed.length > 0) {
            console.error('Notification failed:', result.failed);
            return c.text('Failed to send notification', 500);
        }

        logger.info('Notification sent successfully:', result.sent);
        return c.text('Send notification', 200);
    } catch (error) {
        console.error('Error sending notification:', error);
        return c.text('Failed to send notification', 500);
    } finally {
        apnsConnection.shutdown();
    }
}
