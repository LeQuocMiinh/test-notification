import { z } from "zod";

export const FcmDtoSchema = z.object({
    channelId: z.string(),
    title: z.string(),
    body: z.string(),
    data: z.record(z.any()).optional(),
    android: z
        .object({
            ttl: z.string().optional(),
            priority: z.enum(['high', 'normal']).optional(),
        })
});

export type FcmDtoInterface = z.infer<typeof FcmDtoSchema>;

export async function FcmDtoSchemaHandler(data: unknown): Promise<FcmDtoInterface | Error> {
    try {
        const validate = FcmDtoSchema.parse(data);
        return validate;
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new Error(JSON.stringify(error.errors));
        }
        return new Error("An unexpected error occurred.");
    }
}
