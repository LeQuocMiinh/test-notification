export interface CombindedNotificationInterface {
    channelId: string;
    title: string;
    body: string;
    data?: Record<string, any>;
    apns?: {
        isVoip?: boolean;
        priority?: number;
        category?: string;
        threadId?: string;
        badge?: number;
        collapseId?: string;
    };
    android: {
        priority?: 'high' | 'normal';
    };
}

export interface ApnsNotificationInterface {
    title: string;
    body: string;
    data?: Record<string, any>;
    apns?: {
        isVoip?: boolean;
        priority?: number;
        category?: string;
        threadId?: string;
        badge?: number;
        collapseId?: string;
        args?: string[] | [];
    };
}

export interface FcmNotificationInterface {
    title: string;
    body: string;
    data?: Record<string, any>;
    android?: {
        ttl?: string,
        priority?: 'high' | 'normal';
    };
}


