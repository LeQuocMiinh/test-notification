import { z } from "zod";

export const SubscribeDtoSchema = z.object({
    channelId: z.string().min(1, { message: "channelId is required" }),
    deviceToken: z.string().min(1, { message: "deviceToken is required" })
})

export async function SubscribeDtoSchemaHandler(data: unknown) {
    try {
        const validate = SubscribeDtoSchema.parse(data);
        return validate;
    } catch (error: any) {
        return new Error(error.message);
    }
}