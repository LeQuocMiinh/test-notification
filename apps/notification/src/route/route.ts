import { helloService } from "../api/hello/index.service";
import { IHonoEnv } from "../store/interface";
import { register, unRegister, subcribe, unSubscribe, sendNotification } from "../api";

export function routes(app: IHonoEnv) {
    app.get('/hello', helloService);

    app.post('/send-notification', sendNotification);

    app.post('/register', register);

    app.post('/unregister', unRegister)

    app.post('/subscribe', subcribe);

    app.post('/unsubscribe', unSubscribe)
}