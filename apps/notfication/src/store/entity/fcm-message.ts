export interface FcmMessage {
    notification: {
        title: string;
        body: string;
        image?: string;
    };
    data?: {
        [key: string]: string;
    };
}