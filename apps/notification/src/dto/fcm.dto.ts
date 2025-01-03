import { z } from "zod";

export const FcmDtoSchema = z.object({
    channelId: z.string().nonempty("channelId is required"),
    data: z.record(z.string(), z.string()),
    notification: z
        .object({
            title: z.string().optional(),
            body: z.string().optional(),
        })
        .optional(),
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
