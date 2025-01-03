import { helloService } from "../api/hello/index.service";
import { IHonoEnv } from "../store/interface";
import { register, unRegister, subcribe, unSubscribe, sendNotifications } from "../api";

export function routes(app: IHonoEnv) {
    app.get('/hello', helloService);
    app.post('/send-notification', sendNotifications);
    app.post('/register', register);
    app.post('/unregister', unRegister)
    app.post('/subscribe', subcribe);
    app.post('/unsubscribe', unSubscribe)
}