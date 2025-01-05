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
    android?: {
        priority?: 'high' | 'normal';
        notification?: {
            title?: string;
            body?: string;
        };
    };
}

export interface ApnsNotificationInterface {
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
        args?: string[] | [];
    };
}

export interface FcmNotificationInterface {
    channelId: string;
    title: string;
    body: string;
    data?: Record<string, any>;
    android?: {
        priority?: 'high' | 'normal';
        notification?: {
            title?: string;
            body?: string;
        };
    };
}


