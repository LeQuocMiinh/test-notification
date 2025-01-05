import { z } from "zod";

const RegisterDtoSchema = z.object({
    deviceId: z.string().min(2, { message: "deviceId is required" }),
    appId: z.string().min(2, { message: "appId is required" }),
    token: z.string().min(2, { message: "token is required" }),
    voipToken: z.string().min(2, { message: "voipToken is required" }),
    platform: z.enum(["ios", "android", "web"]),
    status: z.boolean(),
    geocode: z.string().min(2, { message: "geocode is required" }),
    updateTimeLow: z.string().optional(),
    updateTimeHigh: z.string().optional(),
    updateTimeUnsigned: z.string().optional()
});

export type RegisterDtoInterface = z.infer<typeof RegisterDtoSchema>

export async function RegisterDtoSchemaHandler(data: unknown) {
    try {
        const validData = RegisterDtoSchema.parse(data);
        return validData;
    } catch (error: any) {
        return new Error(error.message);
    }
}
