export interface SubscribeRegisterDataInterface {
    channelId: string;
    deviceToken: string;
    deviceId: string;
    appId: string;
    voipToken: string;
    platform: number;
    status: string | null;
    geocode: string;
    updateTimeLow: number;
    updateTimeHigh: number;
    updateTimeUnsigned: boolean;
}
