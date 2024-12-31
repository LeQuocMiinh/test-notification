import { sendToNotification } from "../api/notification/noti-fcm.service";
import { helloService } from "../api/hello/index.service";
import { IHonoEnv } from "../interface";
import { sendNotificationApns } from "../api/notification/noti-apns.service";
import { subcribe } from "../api/subscribe/subscribe.service";
import { register } from "../api/register/register.service";

export function routes(app: IHonoEnv) {
    app.get('/hello', helloService);

    app.post('/notification-fcm', sendToNotification);

    app.post('/notification-apns', sendNotificationApns);

    app.post('/register', register);

    app.post('/subscribe', subcribe);
}