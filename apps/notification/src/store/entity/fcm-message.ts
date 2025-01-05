export interface FcmMessage {
    notification: {
        title: string;
        body: string;
        image?: string;
    };
    android: {
        ttl?: string;
        priority?: 'normal' | 'high'
    },
    data?: {
        [key: string]: string;
    };
    token: string;
}